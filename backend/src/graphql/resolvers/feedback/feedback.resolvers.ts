import { Resolvers } from '@/graphql/__generated__/types';
import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { Feedback } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GraphQLError } from 'graphql';

const resolvers: Resolvers = {
  Mutation: {
    async createFeedback(_, args, ctx) {
      const { reason, message, replyTo } = args.input;

      let createdFeedback: Feedback;

      try {
        createdFeedback = await ctx.prisma.feedback.create({
          data: {
            reason,
            message,
            replyTo,
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2002':
              throw new GraphQLError(
                'Feedback with this information already exists',
                {
                  extensions: {
                    code: 'DUPLICATE_FEEDBACK',
                  },
                },
              );
            case 'P2003':
              throw new GraphQLError('Invalid reference provided', {
                extensions: {
                  code: 'INVALID_REFERENCE',
                },
              });
            case 'P2011':
              throw new GraphQLError('Required field is missing', {
                extensions: {
                  code: 'MISSING_REQUIRED_FIELD',
                },
              });
            case 'P2000':
              throw new GraphQLError('Input value is too long', {
                extensions: {
                  code: 'INPUT_TOO_LONG',
                },
              });
            default:
              console.log('Database error:', error);
              throw new GraphQLError('Database operation failed', {
                extensions: {
                  code: 'DATABASE_ERROR',
                },
              });
          }
        }

        console.error('Unexpected error in createFeedback:', error);
        throw new GraphQLError(
          'An unexpected error occurred while creating feedback',
          {
            extensions: {
              code: 'INTERNAL_ERROR',
            },
          },
        );
      }

      const { notifyNewFeedback } = ctx.telegramBot;

      try {
        await notifyNewFeedback(createdFeedback);
      } catch (error) {
        console.error(
          'An error occured while notifying feedback to the manager:',
          error,
        );
      }

      return createdFeedback;
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {};

export default composeResolvers(resolvers, resolversComposition);
