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

  # input SignupInput {
  #   email: String!
  #   name: String!
  #   password: String!
  # }

  input UpdateTelegramChatIdsInput {
    telegramChatIds: [BigInt!]!
  }

  type Mutation {
    login(loginInput: LoginInput!): AuthPayload!
    # signup(signupInput: SignupInput!): AuthPayload!
    logout: Boolean!
    refreshToken: AuthPayload!
    updateTelegramChatIds(input: UpdateTelegramChatIdsInput!): Boolean!
    authenticateWithTelegramLogin(input: TelegramLoginAuthInput!): TelegramLoginAuthPayload!
    authenticateWithTma(input: TMAAuthInput!): TelegramLoginAuthPayload!
  }

  type TelegramLoginAuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
    isNewUser: Boolean!
  }

  # TMA (Telegram Mini App)
  input TMAAuthInput {
    initDataRaw: String!
  }

  input TelegramLoginAuthInput {
    id: BigInt!
    first_name: String!
    last_name: String
    username: String
    photo_url: String
    auth_date: Date!
    hash: String!
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
    telegram: TelegramLoginUser
  }

  type TelegramChat {
    id: ID!
    chatId: BigInt!
    user: User!
    createdAt: Date!
    updatedAt: Date!
  }

  type TelegramLoginUser {
    id: ID!
    telegramId: BigInt!
    firstName: String!
    lastName: String
    username: String
    photoUrl: String
    authDate: Date!
    languageCode: String
    allowsWriteToPm: Boolean!
    chatInstance: BigInt
    chatType: String
    user: User
    createdAt: Date!
    updatedAt: Date!
  }

  enum Role {
    USER
    ADMIN
    MANAGER
  }
`;
