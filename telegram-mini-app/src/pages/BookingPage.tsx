import { CenteredContent } from "@/components/CenteredContent";
import { Page } from "@/components/Page";
import { Button, List, Multiselect, Section } from "@telegram-apps/telegram-ui";
import { FC } from "react";

export const BookingPage: FC = () => {
  return (
    <Page back={false}>
      <List>
        <Section header="Выбор маршрута">
          <Multiselect
            placeholder="Выберите город отправления"
            value={[]}
            options={[{ label: "", value: "" }]}
          />
          <Multiselect
            placeholder="Выберите город прибытия"
            value={[]}
            options={[{ label: "", value: "" }]}
          />
          <CenteredContent className="py-2">
            <Button mode="bezeled" size="s">
              Далее
            </Button>
          </CenteredContent>
        </Section>
      </List>
    </Page>
  );
};
