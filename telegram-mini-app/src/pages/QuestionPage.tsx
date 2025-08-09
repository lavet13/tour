import { Page } from "@/components/Page";
import { Suspend } from "@/components/suspend";
import { useCreateFeedback } from "@/features/feedback/mutations";
import { useAppForm } from "@/hooks/form";
import { getEmailErrorMessage } from "@/lib/utils";
import { useStore } from "@tanstack/react-form";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { Banner, List, Section } from "@telegram-apps/telegram-ui";
import { FC, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export type DefaultValues = {
  reason: string;
  message: string;
  contactType: string;
  phone?: string;
  email?: string;
  telegram?: string;
};

// https://colinhacks.com/essays/reasonable-email-regex
// Исходный regex из Zod:
// /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
const emailSchema = z.email({ pattern: z.regexes.email });

const QuestionPage: FC = () => {
  // Use useRef to store timeout ID
  const timeoutRef = useRef<number | null>(null);

  const form = useAppForm({
    defaultValues: {
      contactType: "telegram",
      telegram: "",
      email: "",
      message: "",
      reason: "вопрос",
      phone: "",
    } satisfies DefaultValues,
    onSubmit: async ({ value, formApi }) => {
      let replyTo = "";
      const { reason, message } = value;

      switch (value.contactType) {
        case "email":
          replyTo = value.email!;
          break;
        case "telegram":
          replyTo = value.telegram!;
          break;
        case "phone":
          replyTo = value.phone!;
          break;
      }

      const payload = {
        reason,
        message,
        replyTo,
      };

      switch (reason) {
        case "вопрос":
          setMessage((prev) => ({ ...prev, message: "Вопрос отправлен" }));
          break;
        case "жалоба":
          setMessage((prev) => ({ ...prev, message: "Жалоба отправлена" }));
          break;
        case "предложение":
          setMessage((prev) => ({
            ...prev,
            message: "Предложение отправлено",
          }));
          break;
        case "техническая проблема":
          setMessage((prev) => ({
            ...prev,
            message: "Техническая проблема отправлена",
          }));
          break;
      }

      try {
        await sendFeedback({ input: payload });
        // Show success message immediately
        setMessage((prev) => ({
          ...prev,
          isOpen: true,
        }));
        // Hide message after 5 seconds
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setMessage((prev) => ({
            ...prev,
            isOpen: false,
          }));
        }, 5000);

        formApi.reset();
      } catch (error) {
        console.log("Error while submitting feedback");
        // Show error message
        setMessage({
          message: "Произошла ошибка при отправке",
          isOpen: true,
        });

        // Hide error message after 5 seconds
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setMessage((prev) => ({
            ...prev,
            isOpen: false,
          }));
        }, 5000);
      }
    },
  });

  const [message, setMessage] = useState({
    message: "",
    isOpen: false,
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const { mutateAsync: sendFeedback } = useCreateFeedback();

  const { tgWebAppData } = useLaunchParams();
  const username = tgWebAppData?.user?.username;

  useMemo(() => {
    if (username) {
      form.setFieldValue("telegram", `@${username}`);
    }
  }, [username]);

  const contactType = useStore(form.store, (state) => state.values.contactType);

  return (
    <Page>
      <List>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Suspend>
            <Section header="Оставить вопрос | жалобу | предложение">
              {message.isOpen && (
                <Banner
                  type="section"
                  className="text-center mt-2"
                  header={message.message}
                />
              )}
              <form.AppField
                name="reason"
                validators={{
                  onChange: ({ value }) => {
                    if (!value.length) {
                      return "Укажите категорию(вопрос или жалоба)";
                    }

                    return undefined;
                  },
                }}
                children={(field) => {
                  return (
                    <field.SelectField
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                      header="Категория"
                    >
                      <option value="">Выберите категорию</option>
                      <option value="вопрос">Вопрос</option>
                      <option value="жалоба">Жалоба</option>
                      <option value="предложение">Предложение</option>
                      <option value="техническая проблема">
                        Техническая проблема
                      </option>
                    </field.SelectField>
                  );
                }}
              />

              <form.AppField
                name="contactType"
                children={(field) => {
                  return (
                    <field.SelectField
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                      header="Способ связи"
                    >
                      <option>Выберите способ связи</option>
                      <option value="email">E-mail</option>
                      <option value="telegram">Telegram</option>
                      <option value="phone">Телефон</option>
                    </field.SelectField>
                  );
                }}
              />

              <Fragment>
                {contactType === "email" && (
                  <Suspend>
                    <form.AppField
                      name="email"
                      validators={{
                        onChange: ({ value }) => {
                          const result = emailSchema.safeParse(value);

                          if (result.error) {
                            return getEmailErrorMessage(value);
                          }

                          return undefined;
                        },
                      }}
                      children={(field) => {
                        return (
                          <field.TextField
                            header="E-mail"
                            placeholder="example@gmail.com"
                            type="email"
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        );
                      }}
                    />
                  </Suspend>
                )}
                {contactType === "telegram" && (
                  <Suspend>
                    <form.AppField
                      name="telegram"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value.length) {
                            return "Telegram обязателен к заполнению!";
                          }
                          const isTelegramValid = /^@[a-zA-Z0-9_]{4,32}$/.test(
                            value,
                          );
                          if (!isTelegramValid) {
                            return "Имя пользователя должно начинаться с @ и содержать только буквы, цифры и _ (от 4 до 32 символов после @)";
                          }
                          return undefined;
                        },
                      }}
                      children={(field) => {
                        return (
                          <field.TextField
                            header="Telegram"
                            placeholder={"@username"}
                            onChange={(e) => {
                              let inputValue = e.target.value;

                              // Ensure it always starts with @
                              if (!inputValue.startsWith("@")) {
                                inputValue =
                                  "@" + inputValue.replace(/^@+/, "");
                              }

                              // Remove invalid characters (keep only alphanumeric and underscore after @)
                              inputValue =
                                "@" +
                                inputValue
                                  .slice(1)
                                  .replace(/[^a-zA-Z0-9_]/g, "");

                              // Limit length (Telegram usernames are max 32 chars + @)
                              if (inputValue.length > 33) {
                                inputValue = inputValue.slice(0, 33);
                              }

                              field.handleChange(inputValue);
                            }}
                          />
                        );
                      }}
                    />
                  </Suspend>
                )}
                {contactType === "phone" && (
                  <Suspend>
                    <form.AppField
                      name="phone"
                      validators={{
                        onChange: ({ value }) => {
                          return !isPossiblePhoneNumber(value)
                            ? "Проверьте правильно ли ввели номер телефона"
                            : undefined;
                        },
                      }}
                      children={(field) => {
                        return (
                          <field.PhoneField
                            header="Телефон"
                            placeholder="Введите номер телефона"
                          />
                        );
                      }}
                    />
                  </Suspend>
                )}
              </Fragment>

              <form.AppField
                name="message"
                validators={{
                  onChange: ({ value }) => {
                    if (!value.length) {
                      return "Укажите сообщение";
                    }
                    if (value.length < 4) {
                      return "Сообщение слишком короткое (минимум 4 символа)";
                    }
                    return undefined;
                  },
                }}
                children={(field) => {
                  return (
                    <field.TextareaField
                      header="Сообщение"
                      placeholder="Сообщение..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  );
                }}
              />
            </Section>
          </Suspend>

          <Section className="p-4 bg-background">
            <form.AppForm>
              <form.SubscribeButton
                className="w-full"
                type="submit"
                size="l"
                mode="filled"
                label="Отправить"
              />
            </form.AppForm>
          </Section>
        </form>
      </List>
    </Page>
  );
};

export default QuestionPage;
