import { Section, Cell, List } from "@telegram-apps/telegram-ui";
import type { FC } from "react";

import { Link } from "@/components/Link.tsx";
import { Page } from "@/components/Page.tsx";

export const IndexPage: FC = () => {
  return (
    <Page back={false}>
      <List>
        <Section header="Услуги">
          <Link to="/booking">
            <Cell
              subtitle="Быстро и удобно забронируйте нужную услугу"
              before="📅"
            >
              Оставить заявку на бронирование
            </Cell>
          </Link>

          <Link to="/question">
            <Cell subtitle="Есть вопросы? Мы поможем!" before="❓">
              Задать вопрос
            </Cell>
          </Link>
        </Section>

        <Section
          header="Наши контакты"
        >
          <Cell
            Component="a"
            href="tel:+79493180304"
            subtitle="Феникс"
            before="📞"
          >
            +7 949 318 03 04
          </Cell>

          <Cell
            Component="a"
            href="tel:+79494395616"
            subtitle="Феникс"
            before="📞"
          >
            +7 949 439 56 16
          </Cell>

          <Cell
            Component="a"
            href="https://wa.me/380713180304"
            target="_blank"
            subtitle="WhatsApp"
            before="📩"
          >
            +380 71 318 03 04
          </Cell>

          <Cell
            Component="a"
            href="https://t.me/+79493180304"
            target="_blank"
            subtitle="Telegram"
            before="📩"
          >
            +7 949 318 03 04
          </Cell>

          <Cell
            Component="a"
            href="https://vk.com/go_to_krym"
            target="_blank"
            subtitle="Мы ВКонтакте"
            before="🔗"
          >
            vk.com/go_to_krym
          </Cell>

          <Cell
            Component="a"
            href="https://t.me/Donbass_Tur"
            subtitle="Наш телеграмм канал"
            before="📢"
          >
            t.me/Donbass_Tur
          </Cell>

          <Cell
            Component="a"
            target="_blank"
            href="https://donbass-tour.online"
            subtitle="Наш сайт"
            before="🌐"
          >
            donbass-tour.online
          </Cell>
        </Section>
      </List>
    </Page>
  );
};
