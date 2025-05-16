import TelegramBot from 'node-telegram-bot-api';

export type TelegramBotConfig = {
  enabled: boolean;
  botToken: string;
  miniAppUrl: string;
};

export type CommandHandler = {
  regex: RegExp;
  handler: (
    msg: TelegramBot.Message,
    match: RegExpExecArray | null,
  ) => Promise<void>;
};

export type CallbackHandler = {
  canHandle: (data: string) => boolean;
  handle: (
    bot: TelegramBot,
    chatId: number | string,
    messageId: number,
    data: string,
    query: TelegramBot.CallbackQuery,
  ) => Promise<void>;
};

export type BotFeature = {
  name: string;
  commands?: TelegramBot.BotCommand[];
  commandHandlers?: CommandHandler[];
  callbackHandlers?: CallbackHandler[];
  init?: (bot: TelegramBot) => Promise<void>;
};

export type TelegramBotState = Readonly<{
  bot: TelegramBot | null;
  features: BotFeature[];
  config: TelegramBotConfig;
}>;

export type TelegramErrorCode = 'EFATAL' | 'EPARSE' | 'ETELEGRAM';

export type TelegramErrorParams = {
  code: TelegramErrorCode;
  response?: {
    body:
      | string
      | {
          ok: boolean;
          error_code: number;
          description: string;
        };
  };
};

export class TelegramBotError extends Error {
  code: TelegramErrorCode;
  response?: {
    body:
      | string
      | {
          ok: boolean;
          error_code: number;
          description: string;
        };
  };

  constructor(message: string, params: TelegramErrorParams) {
    super(message);
    this.name = 'TelegramBotError';
    this.code = params.code;
    this.response = params.response;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TelegramBotError);
    }
  }

  get [Symbol.toStringTag](): string {
    return 'TelegramBotError';
  }
}

// Specific error classes for each error type
export class TelegramFatalError extends TelegramBotError {
  constructor(message: string) {
    super(message, { code: 'EFATAL' });
    this.name = 'TelegramFatalError';
  }
}

export class TelegramParseError extends TelegramBotError {
  constructor(message: string, response: { body: string }) {
    super(message, { code: 'EPARSE', response });
    this.name = 'TelegramParseError';
  }
}

export class TelegramAPIError extends TelegramBotError {
  constructor(
    message: string,
    response: {
      body: { ok: boolean; error_code: number; description: string };
    },
  ) {
    super(message, { code: 'ETELEGRAM', response });
    this.name = 'TelegramAPIError';
  }
}

// Type guards for error checking
export function isErrorWithCode(error: unknown): error is { code: string } {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof (error as any).code === 'string',
  );
}

export function isErrorWithResponse(error: unknown): error is {
  response: { body: any };
} {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as any).response &&
      typeof (error as any).response === 'object' &&
      'body' in (error as any).response,
  );
}
