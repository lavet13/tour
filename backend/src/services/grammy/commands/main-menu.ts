import { Composer } from 'grammy';
import { startMenu } from '@/services/grammy/commands/start/menu';

const mainMenu = new Composer();

// no need to also listening for contacts-menu since it's registered under
// startMenu
mainMenu.use(startMenu);

export { mainMenu };
