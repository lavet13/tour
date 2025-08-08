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
import { hasRoles } from '@/graphql/composition/authorization';
import crypto from 'crypto';
import validatePassword from '@/helpers/validate-password';

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
    async authenticateWithTelegramLogin(_, args, ctx) {
      const { hash, ...dataToCheck } = args.input;
      console.log({ input: args.input });

      const botToken = ctx.bot.token;

      if (!botToken) {
        throw new GraphQLError('Telegram bot token not configured');
      }

      // Convert auth_date to Unix timestamp in seconds if it's a Date object
      const dataForHash = { ...dataToCheck };
      if (dataForHash.auth_date instanceof Date) {
        dataForHash.auth_date = Math.floor(
          dataForHash.auth_date.getTime() / 1000,
        );
      } else if (typeof dataForHash.auth_date === 'number') {
        // If auth_date is a number (likely in milliseconds due to frontend), convert to seconds
        dataForHash.auth_date = Math.floor(dataForHash.auth_date / 1000);
      }

      // Create data check string exactly as Telegram specifies
      const dataCheckString = Object.keys(dataForHash)
        .sort()
        .filter(key => dataForHash[key as keyof typeof dataForHash] != null) // Exclude null/undefined values
        .map(key => `${key}=${dataForHash[key as keyof typeof dataForHash]}`)
        .join('\n');

      // Create HMAC signature
      const secretKey = crypto.createHash('sha256').update(botToken).digest();
      const hmac = crypto.createHmac('sha256', secretKey);
      hmac.update(dataCheckString);
      const calculatedHash = hmac.digest('hex');

      // Add this after creating dataCheckString for debugging
      console.log('Debug info:', {
        botToken: botToken.substring(0, 10) + '...', // Don't log full token
        dataCheckString,
        secretKeyHex: secretKey.toString('hex'),
        calculatedHash,
        providedHash: hash,
      });

      // Verify the Telegram authentication data
      const isValidTelegramAuth = calculatedHash === hash;

      if (!isValidTelegramAuth) {
        console.error('Hash verification failed:', {
          provided: hash,
          calculated: calculatedHash,
          dataString: dataCheckString,
          originalAuthDate: args.input.auth_date,
        });
        throw new GraphQLError('Invalid Telegram authentication data');
      }

      // Check auth data freshness
      const authTimestamp =
        typeof args.input.auth_date === 'object' &&
        args.input.auth_date instanceof Date
          ? args.input.auth_date.getTime()
          : args.input.auth_date; // Convert Unix timestamp to milliseconds

      const now = Date.now();
      const maxAgeMinutes = 60; // 60 minutes
      const maxAge = maxAgeMinutes * 60 * 1000;

      const isTelegramAuthDataFresh = now - authTimestamp <= maxAge;

      if (!isTelegramAuthDataFresh) {
        console.error('Auth data too old:', {
          authTimestamp: new Date(authTimestamp),
          now: new Date(now),
          ageMinutes: (now - authTimestamp) / (60 * 1000),
          maxAgeMinutes,
        });
        throw new GraphQLError(
          `Telegram authentication data is too old. Please try logging in again.`,
        );
      }

      const telegramId = dataToCheck.id;
      const authDate = new Date(authTimestamp);

      let transactionResult;

      try {
        transactionResult = await ctx.prisma.$transaction(async tx => {
          let telegramUser = await tx.telegramUser.findUnique({
            where: { telegramId },
          });

          let user;
          let isNewUser = false;
          const displayName = dataToCheck.last_name
            ? `${dataToCheck.first_name.toLowerCase()} ${dataToCheck.last_name.toLowerCase()}`
            : dataToCheck.first_name.toLowerCase();

          if (telegramUser) {
            // Update existing Telegram user data
            telegramUser = await tx.telegramUser.update({
              where: { telegramId },
              data: {
                firstName: dataToCheck.first_name,
                lastName: dataToCheck.last_name,
                username: dataToCheck.username,
                photoUrl: dataToCheck.photo_url,
                authDate,
              },
              include: { user: { include: { roles: true } } },
            });

            if (telegramUser.userId) {
              user = await tx.user.findUniqueOrThrow({
                where: { id: telegramUser.userId },
                include: { roles: true },
              });
            } else {
              // Create new User and link to existing TelegramUser
              user = await tx.user.create({
                data: {
                  name: displayName,
                  roles: {
                    create: {
                      role: 'USER',
                    },
                  },
                },
                include: { roles: true },
              });

              await tx.telegramUser.update({
                where: { telegramId },
                data: { userId: user.id },
              });

              isNewUser = true;
            }
          } else {
            user = await tx.user.findUnique({
              where: {
                id: ctx.me!.id,
              },
              include: { roles: true },
            });

            if (user) isNewUser = false;

            if (!user) {
              isNewUser = true;
              // Create new User and TelegramUser
              user = await tx.user.create({
                data: {
                  name: displayName,
                  roles: {
                    create: {
                      role: 'USER',
                    },
                  },
                },
                include: { roles: true },
              });
            }

            await tx.telegramUser.create({
              data: {
                telegramId,
                firstName: dataToCheck.first_name,
                lastName: dataToCheck.last_name,
                username: dataToCheck.username,
                photoUrl: dataToCheck.photo_url,
                authDate,
                userId: user.id,
              },
            });
          }

          const { accessToken, refreshToken } = createTokens(user);

          await tx.refreshToken.create({
            data: {
              token: refreshToken,
              userId: user.id,
            },
          });

          console.log(
            'Telegram authentication successful for user:',
            user.name,
          );
          return { user, isNewUser, accessToken, refreshToken };
        });
      } catch (error) {
        console.error('Telegram authentication transaction error:', error);
        throw new GraphQLError('Failed to authenticate with Telegram');
      }

      // Set cookies
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
        console.log('Telegram authentication cookies set successfully');
      } catch (reason) {
        console.error(`Failed to set cookies: ${reason}`);

        try {
          await ctx.prisma.refreshToken.delete({
            where: { token: transactionResult.refreshToken },
          });
        } catch (cleanupError) {
          console.error('Failed to cleanup refresh token:', cleanupError);
        }

        throw new GraphQLError(
          'Failed while setting the authentication cookie',
        );
      }

      return {
        user: transactionResult.user,
        isNewUser: transactionResult.isNewUser,
        accessToken: transactionResult.accessToken,
        refreshToken: transactionResult.refreshToken,
      };
    },
    async authenticateWithTma(_, args, ctx) {
      const { initDataRaw } = args.input;

      const botToken = ctx.bot.token;

      if (!botToken) {
        throw new GraphQLError('Telegram bot token not configured');
      }

      const urlParams = new URLSearchParams(initDataRaw);
      const hash = urlParams.get('hash');

      if (!hash) {
        throw new GraphQLError('Missing hash in init data');
      }

      // Remove hash and signature from validation data
      urlParams.delete('hash');

      // Create data check string exactly as Telegram specifies
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => {
          return a.localeCompare(b);
        }) // Sort by key
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Create HMAC signature
      // Step 1: Create HMAC-SHA256 of bot token using "WebAppData" as key
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      // Step 2: Create HMAC-SHA256 of data check string using the result
      // from step 1 as key
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      // Add this after creating dataCheckString for debugging
      // console.log('Debug info:', {
      //   botToken: botToken.substring(0, 10) + '...', // Don't log full token
      //   dataCheckString,
      //   secretKeyHex: secretKey.toString('hex'),
      //   calculatedHash,
      //   providedHash: hash,
      //   argsInput: args.input,
      // });

      // Verify the Telegram authentication data
      const isValidTelegramAuth = calculatedHash === hash;

      if (!isValidTelegramAuth) {
        // console.error('Hash verification failed:', {
        //   provided: hash,
        //   calculated: calculatedHash,
        //   dataString: dataCheckString,
        // });
        throw new GraphQLError('Invalid Telegram authentication data');
      }

      const authDate = parseInt(urlParams.get('auth_date') || '0');
      const chatInstance = BigInt(urlParams.get('chat_instance') || '0');
      const chatType = urlParams.get('chat_type');
      const userJson = urlParams.get('user');

      if (!userJson) {
        throw new GraphQLError('Missing user data');
      }

      let userObject: Record<string, any>;
      try {
        userObject = JSON.parse(userJson);
      } catch (error) {
        throw new GraphQLError('Invalid user JSON format');
      }

      // Check auth data freshness
      const authTimestamp = authDate * 1000; // Convert to milliseconds
      const now = Date.now();
      const maxAgeMinutes = 60;
      const maxAge = maxAgeMinutes * 60 * 1000;

      if (now - authTimestamp > maxAge) {
        // console.error('Auth data too old:', {
        //   authTimestamp: new Date(authTimestamp),
        //   now: new Date(now),
        //   ageMinutes: (now - authTimestamp) / (60 * 1000),
        //   maxAgeMinutes,
        // });
        throw new GraphQLError(
          'Telegram authentication data is too old. Please try logging in again.',
        );
      }

      // Convert string to BigInt for database operations
      const telegramId = BigInt(userObject.id);
      const authDateObj = new Date(authTimestamp);

      let transactionResult;

      try {
        transactionResult = await ctx.prisma.$transaction(async tx => {
          let telegramUser = await tx.telegramUser.findUnique({
            where: { telegramId },
          });

          let user;
          let isNewUser = false;
          const displayName = userObject.last_name
            ? `${userObject.first_name.toLowerCase()} ${userObject.last_name.toLowerCase()}`
            : userObject.first_name.toLowerCase();

          if (telegramUser) {
            // Update existing Telegram user data
            telegramUser = await tx.telegramUser.update({
              where: { telegramId },
              data: {
                firstName: userObject.first_name,
                lastName: userObject.last_name,
                username: userObject.username,
                photoUrl: userObject.photo_url,
                authDate: authDateObj,
                allowsWriteToPm: userObject.allows_write_to_pm,
                chatInstance,
                chatType,
                languageCode: userObject.language_code,
              },
              include: { user: { include: { roles: true } } },
            });

            if (telegramUser.userId) {
              user = await tx.user.findUniqueOrThrow({
                where: { id: telegramUser.userId },
                include: { roles: true },
              });
            } else {
              // Create new User and link to existing TelegramUser
              user = await tx.user.create({
                data: {
                  name: displayName,
                  roles: {
                    create: {
                      role: 'USER',
                    },
                  },
                },
                include: { roles: true },
              });

              telegramUser = await tx.telegramUser.update({
                where: { telegramId },
                data: { userId: user.id },
              });

              isNewUser = true;
            }
          } else {
            user = await tx.user.findFirst({
              where: {
                telegramUser: {
                  telegramId,
                },
              },
              include: {
                roles: true,
              },
            });

            if (user) isNewUser = false;

            if (!user) {
              isNewUser = true;
              // Create new User and TelegramUser
              user = await tx.user.create({
                data: {
                  name: displayName,
                  roles: {
                    create: {
                      role: 'USER',
                    },
                  },
                },
                include: { roles: true },
              });
            }

            telegramUser = await tx.telegramUser.create({
              data: {
                userId: user.id,
                telegramId,
                firstName: userObject.first_name,
                lastName: userObject.last_name,
                username: userObject.username,
                photoUrl: userObject.photo_url,
                authDate: authDateObj,
                allowsWriteToPm: userObject.allows_write_to_pm,
                chatInstance,
                chatType,
                languageCode: userObject.language_code,
              },
            });
          }

          const { accessToken, refreshToken } = createTokens(user);

          await tx.refreshToken.create({
            data: {
              token: refreshToken,
              userId: user.id,
            },
          });

          console.log(
            'Telegram authentication successful for user:',
            user.name,
          );

          return { user, isNewUser, accessToken, refreshToken };
        });
      } catch (error) {
        console.error('Telegram authentication transaction error:', error);
        throw new GraphQLError('Failed to authenticate with Telegram');
      }

      // Set cookies
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
        console.log('Telegram authentication cookies set successfully');
      } catch (reason) {
        console.error(`Failed to set cookies: ${reason}`);

        try {
          await ctx.prisma.refreshToken.delete({
            where: { token: transactionResult.refreshToken },
          });
        } catch (cleanupError) {
          console.error('Failed to cleanup refresh token:', cleanupError);
        }

        throw new GraphQLError(
          'Failed while setting the authentication cookie',
        );
      }

      return {
        user: transactionResult.user,
        isNewUser: transactionResult.isNewUser,
        accessToken: transactionResult.accessToken,
        refreshToken: transactionResult.refreshToken,
      };
    },
    async login(_, args, ctx) {
      const { login, password } = args.loginInput;

      let transactionResult;
      try {
        transactionResult = await ctx.prisma.$transaction(async tx => {
          const user = await tx.user.findFirst({
            where: {
              OR: [
                {
                  name: login,
                },
                {
                  email: login,
                },
              ],
            },
            include: {
              roles: true,
            },
          });

          if (!user) {
            throw new GraphQLError('Такого пользователя не существует!');
          }

          if (!user.password) {
            throw new GraphQLError(
              'У пользователя нет пароля. Вход только через Telegram',
            );
          }

          let isValid = false;
          if (user.password) {
            isValid = await validatePassword(password, user.password);
          }
          if (!isValid) {
            throw new GraphQLError('Введен неверный пароль!');
          }

          const { accessToken, refreshToken } = createTokens(user);

          await tx.refreshToken.create({
            data: {
              token: refreshToken,
              userId: user.id,
            },
          });

          console.log('User logged in successfully');
          return { accessToken, refreshToken };
        });
      } catch (error) {
        console.error('Transaction failed while logging in ther user', error);
        throw new GraphQLError('Неизвестная ошибка при попытке войти');
      }

      // If transaction succeeded, set the cookie
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
        console.log('Login cookies set successfully');
      } catch (reason) {
        console.error(`Failed to set cookies: ${reason}`);

        // Attempt to delete a token if cookie setting fails
        try {
          await ctx.prisma.refreshToken.delete({
            where: {
              token: transactionResult.refreshToken,
            },
          });
          console.log('Cleaned up refresh token due to cookie setting failure');
        } catch (cleanupError) {
          console.error('Failed to cleanup refresh token: ' + cleanupError);
        }

        throw new GraphQLError('Failed while setting the cookie');
      }

      return {
        accessToken: transactionResult.accessToken,
        refreshToken: transactionResult.refreshToken,
      };
    },
    // async signup(_, args, ctx) {
    //   const { email, name, password } = args.signupInput;
    //
    //   const { refreshToken, accessToken } = await ctx.prisma.user.signup(
    //     email,
    //     name,
    //     password,
    //   );
    //
    //   try {
    //     await ctx.request.cookieStore?.set({
    //       name: 'accessToken',
    //       value: accessToken,
    //       ...cookieOpts,
    //     });
    //     await ctx.request.cookieStore?.set({
    //       name: 'refreshToken',
    //       value: refreshToken,
    //       ...cookieOpts,
    //     });
    //   } catch (reason) {
    //     console.error(`It failed: ${reason}`);
    //     throw new GraphQLError(`Failed while setting the cookie`);
    //   }
    //
    //   // console.log({ authorization: await ctx.request.cookieStore?.get('authorization') });
    //   // console.log({ cookies: await ctx.request.cookieStore?.getAll()});
    //
    //   return { accessToken, refreshToken };
    // },
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

      try {
        await ctx.prisma.$transaction(async tx => {
          const existingChats = await tx.telegramChat.findMany({
            where: {
              userId: ctx.me!.id,
            },
            select: {
              chatId: true,
            },
          });

          const existingChatIds = new Set(
            existingChats.map(chat => chat.chatId),
          );
          const newChatIds = new Set(telegramChatIds);
          const chatIdsToAdd = telegramChatIds.filter(
            id => !existingChatIds.has(id),
          );
          const chatIdsToRemove = existingChats
            .filter(chat => !newChatIds.has(chat.chatId))
            .map(chat => chat.chatId);

          if (chatIdsToRemove.length > 0) {
            await tx.telegramChat.deleteMany({
              where: {
                userId: ctx.me!.id,
                chatId: { in: chatIdsToRemove },
              },
            });
          }

          // Update the user record with the Telegram chat IDs
          await Promise.all(
            chatIdsToAdd.map(chatId =>
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
    async telegram(parent, _, ctx) {
      const telegramUser = await ctx.prisma.telegramUser.findUnique({
        where: {
          userId: parent.id,
        },
      });

      return telegramUser;
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.me': [isAuthenticated()],
  'Query.telegramChats': [isAuthenticated(), hasRoles(['ADMIN', 'MANAGER'])],
  'Mutation.updateTelegramChatIds': [
    isAuthenticated(),
    hasRoles(['ADMIN', 'MANAGER']),
  ],
};

export default composeResolvers(resolvers, resolversComposition);
