import gql from 'graphql-tag';

export default gql`
  type Query {
    me: User
    telegramChats: [TelegramChat!]!
  }

  input LoginInput {
    login: String!
    password: String!
  }

  input SignupInput {
    email: String!
    name: String!
    password: String!
  }

  input UpdateTelegramChatIdsInput {
    telegramChatIds: [String!]!
  }

  type Mutation {
    login(loginInput: LoginInput!): AuthPayload!
    signup(signupInput: SignupInput!): AuthPayload!
    logout: Boolean!
    refreshToken: AuthPayload!
    updateTelegramChatIds(input: UpdateTelegramChatIdsInput!): Boolean!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    roles: [Role!]!
    telegramChats: [TelegramChat]!
  }

  type TelegramChat {
    id: ID!
    chatId: String!
    user: User!
    createdAt: Date!
    updatedAt: Date!
  }

  enum Role {
    USER
    ADMIN
    MANAGER
  }
`;
