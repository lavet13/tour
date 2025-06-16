import { gql } from 'graphql-tag';

export default gql`
  type Mutation {
    createFeedback(input: CreateFeedbackInput!): Feedback!
  }

  input CreateFeedbackInput {
    reason: String!
    replyTo: String!
    message: String!
  }

  type Feedback {
    reason: String!
    replyTo: String!
    message: String!
    createdAt: Date!
    updatedAt: Date!
  }
`;
