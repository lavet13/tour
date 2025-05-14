import { Resolvers } from '@/graphql/__generated__/types';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { isAuthenticated } from '@/graphql/composition/authorization';
import { GraphQLError } from 'graphql';
import { verifyRefreshToken } from '@/helpers/auth';
import createTokens from '@/helpers/create-tokens';
import { ErrorCode } from '@/helpers/error-codes';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { cookieOpts } from '@/helpers/cookie-opts';

const resolvers: Resolvers = {
  Query: {
    me(_, __, ctx) {
      return ctx.prisma.user.findFirst({
        where: {
          id: ctx.me!.id,
        },
      });
    },
    async telegramChats(_, __, ctx) {
      return ctx.prisma.telegramChat.findMany({
        where: {
          userId: ctx.me!.id,
        },
      });
    },
  },
  Mutation: {
    async refreshToken(_, __, ctx) {
      const refreshTokenCookie =
        await ctx.request.cookieStore?.get('refreshToken');

      if (!refreshTokenCookie) {
        await ctx.request.cookieStore?.delete('accessToken');
        await ctx.request.cookieStore?.delete('refreshToken');
        console.log('Tokens deleted: no refresh token in cookies');

        throw new GraphQLError('Refresh token not found', {
          extensions: { code: ErrorCode.AUTHENTICATION_REQUIRED },
        });
      }

      let transactionResult;

      try {
        // Run the entire token refresh process in a transaction
        transactionResult = await ctx.prisma.$transaction(async tx => {
          // Try to find the refresh token record
          const tokenRecord = await tx.refreshToken.findUnique({
            where: {
              token: refreshTokenCookie.value,
            },
            include: {
              user: {
                include: {
                  roles: true,
                },
              },
            },
          });

          // If token doesn't exist in database
          if (!tokenRecord) {
            console.log('Refresh token not found in database');

            throw new GraphQLError('Cannot find token in database', {
              extensions: { code: ErrorCode.AUTHENTICATION_REQUIRED },
            });
          }

          // Verify the refresh token
          try {
            verifyRefreshToken(refreshTokenCookie.value);
          } catch (error: any) {
            console.log({ error });

            // Clean up if token is expired or invalid
            if (error instanceof GraphQLError) {
              try {
                await tx.refreshToken.delete({
                  where: {
                    token: tokenRecord.token,
                    userId: tokenRecord.userId,
                  },
                });
                console.log('Deleted expired/invalid token from database');
              } catch (deleteError) {
                console.error(
                  'Failed to delete token from database: ' + deleteError,
                );
              }
            }

            // Re-throw the original error to fail the transaction
            throw error;
          }

          // Generate new tokens
          const { accessToken, refreshToken: newRefreshToken } = createTokens(
            tokenRecord.user,
          );

          // Update refresh token in database
          try {
            await tx.refreshToken.update({
              where: {
                token: tokenRecord.token,
              },
              data: {
                token: newRefreshToken,
              },
            });
          } catch (error) {
            if (
              error instanceof PrismaClientKnownRequestError &&
              error.code === 'P2025'
            ) {
              throw new GraphQLError(
                `Refresh token was not found. Can\'t update`,
              );
            }
            throw error;
          }

          console.log(`Tokens refreshed successfully`);
          return {
            accessToken,
            refreshToken: newRefreshToken,
            originalToken: tokenRecord,
          };
        });
      } catch (error) {
        // Transaction failed, clean up cookies and ensure database consistency
        try {
          // First clean up cookies
          await ctx.request.cookieStore?.delete('accessToken');
          await ctx.request.cookieStore?.delete('refreshToken');
          console.log('Cookies deleted due to failed token refresh');
        } catch (cookieError) {
          console.error('Failed to delete cookies:', cookieError);
        }

        // Re-throw the original error
        throw error;
      }

      // If transaction succeeded, set the new cookies
      try {
        await ctx.request.cookieStore?.set({
          name: 'accessToken',
          value: transactionResult.accessToken,
          ...cookieOpts,
        });
        await ctx.request.cookieStore?.set({
          name: 'refreshToken',
          value: transactionResult.refreshToken,
          ...cookieOpts,
        });
        console.log('New cookies set successfully');
      } catch (reason) {
        console.error('Failed to set cookies: ' + reason);

        // Attempt to roll back the token update if cookie setting fails
        try {
          await ctx.prisma.refreshToken.update({
            where: { id: transactionResult.originalToken.id },
            data: { token: transactionResult.originalToken.token },
          });
          console.log('Rolled back token update due to cookie setting failure');
        } catch (rollbackError) {
          console.error('Failed to rollback token update: ' + rollbackError);
        }

        throw new GraphQLError('Failed while setting the cookie');
      }

      return {
        accessToken: transactionResult.accessToken,
        refreshToken: transactionResult.refreshToken,
      };
    },
    async login(_, args, ctx) {
      const { login, password } = args.loginInput;
      const { refreshToken, accessToken } = await ctx.prisma.user.login(
        login,
        password,
      );

      try {
        await ctx.request.cookieStore?.set({
          name: 'accessToken',
          value: accessToken,
          ...cookieOpts,
        });

        await ctx.request.cookieStore?.set({
          name: 'refreshToken',
          value: refreshToken,
          ...cookieOpts,
        });
      } catch (reason) {
        console.error(`It failed: ${reason}`);
        throw new GraphQLError(`Failed while setting the cookie`);
      }

      return { accessToken, refreshToken };
    },
    async signup(_, args, ctx) {
      const { email, name, password } = args.signupInput;

      const { refreshToken, accessToken } = await ctx.prisma.user.signup(
        email,
        name,
        password,
      );

      try {
        await ctx.request.cookieStore?.set({
          name: 'accessToken',
          value: accessToken,
          ...cookieOpts,
        });
        await ctx.request.cookieStore?.set({
          name: 'refreshToken',
          value: refreshToken,
          ...cookieOpts,
        });
      } catch (reason) {
        console.error(`It failed: ${reason}`);
        throw new GraphQLError(`Failed while setting the cookie`);
      }

      // console.log({ authorization: await ctx.request.cookieStore?.get('authorization') });
      // console.log({ cookies: await ctx.request.cookieStore?.getAll()});

      return { accessToken, refreshToken };
    },
    async logout(_, __, ctx) {
      const refreshToken = await ctx.request.cookieStore?.get('refreshToken');

      if (refreshToken) {
        await ctx.prisma.refreshToken
          .delete({
            where: {
              token: refreshToken.value,
            },
          })
          .catch(async err => {
            if (err instanceof PrismaClientKnownRequestError) {
              if (err.code === 'P2025') {
                await ctx.request.cookieStore?.delete('accessToken');
                await ctx.request.cookieStore?.delete('refreshToken');

                return Promise.reject(
                  new GraphQLError(
                    `Refresh token was not found. Can\'t delete`,
                    {
                      extensions: { code: ErrorCode.AUTHENTICATION_REQUIRED },
                    },
                  ),
                );
              }
            }

            return Promise.reject(err);
          });
      }

      await ctx.request.cookieStore?.delete('accessToken');
      await ctx.request.cookieStore?.delete('refreshToken');
      console.log('token deleted after logging out');

      return true;
    },
    async updateTelegramChatIds(_, args, ctx) {
      const { telegramChatIds } = args.input;

      let transactionResult;

      try {
        transactionResult = await ctx.prisma.$transaction(async tx => {
          await tx.telegramChat.deleteMany({
            where: {
              userId: ctx.me!.id,
            },
          });

          // Update the user record with the Telegram chat IDs
          await Promise.all(
            telegramChatIds.map(chatId =>
              tx.telegramChat.create({
                data: {
                  userId: ctx.me?.id,
                  chatId,
                },
              }),
            ),
          );
        });
      } catch (reason) {
        console.error(`It failed: ${reason}`);
        throw new GraphQLError(
          `Transacition failed while processing telegram Chat IDs`,
        );
      }

      return true;
    },
  },
  User: {
    async roles(parent, _, ctx) {
      const userRole = await ctx.prisma.userRole.findMany({
        where: {
          userId: parent.id,
        },
        select: {
          role: true,
        },
      });

      const roles = userRole.map(r => r.role);

      console.log({ roles });

      return roles;
    },
    async telegramChats(parent, _, ctx) {
      return ctx.loaders.telegramChatIdsLoader.load(parent.id);
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.me': [isAuthenticated()],
  'Query.telegramChats': [isAuthenticated()],
  'Mutation.updateTelegramChatIds': [isAuthenticated()],
};

export default composeResolvers(resolvers, resolversComposition);
