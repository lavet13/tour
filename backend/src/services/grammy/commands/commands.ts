import startCommand from '@/services/grammy/commands/start';
import myChatIdCommand from '@/services/grammy/commands/my-chat-id';
import appCommand from '@/services/grammy/commands/app';

import { CommandGroup } from '@grammyjs/commands';

const commands = new CommandGroup();

commands.add([startCommand, myChatIdCommand, appCommand]);

export { commands };
