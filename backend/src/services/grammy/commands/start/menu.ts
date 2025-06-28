import { Menu } from '@grammyjs/menu';

const startMenu = new Menu('start-menu')
  .submenu('📞 Контакты', 'contacts-menu', async ctx => {
    await ctx.editMessageText(
      `
<b>Наши контакты</b>

📞 Феникс: +79493180304
📞 Феникс: +79494395616
📩 Whatsapp: +380713180304
📩 Telegram: <a href="https://t.me/+79493180304">+79493180304</a>
Мы ВКонтакте:
vk.com/go_to_krym
Присоединяйтесь к нашему телеграмм каналу:
t.me/Donbass_Tur
Наш сайт:
donbass-tour.online
`,
      {
        parse_mode: 'HTML',
      },
    );
  })
  .webApp('📲 Открыть приложение', import.meta.env.VITE_TELEGRAM_MINI_APP_URL);

const contactsMenu = new Menu('contacts-menu').text('Назад', async ctx => {
  await ctx.editMessageText('🏡 Главное меню', { reply_markup: startMenu });
});

startMenu.register(contactsMenu);

export { startMenu };
