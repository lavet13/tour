import { Page } from "@/components/Page";
import {
  useArrivalCities,
  useDepartureCities,
  useRouteByIds,
} from "@/features/create-booking/queries";
import { useStore } from "@tanstack/react-form";
import {
  Banner,
  Button,
  Checkbox,
  Divider,
  IconButton,
  List,
  Section,
} from "@telegram-apps/telegram-ui";
import { ArrowRightLeft, Loader2, Minus, Plus, X } from "lucide-react";
import { FC, Fragment, useMemo } from "react";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { useAppForm } from "@/hooks/form";
import { cn } from "@/lib/utils";
import { NumericFormat } from "react-number-format";
import { useCreateBooking } from "@/features/create-booking/mutations";
import {
  CreateBookingInput,
  GetRouteByIdsQuery,
  RouteDirection,
} from "@/gql/graphql";
import {
  initDataState as _initDataState,
  hapticFeedback,
  useSignal,
} from "@telegram-apps/sdk-react";
import { Label } from "@/components/ui/label";

type Route = GetRouteByIdsQuery["routeByIds"];

export const BookingPage: FC = () => {
  const { mutateAsync: createBooking } = useCreateBooking();
  const initDataState = useSignal(_initDataState);

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phones: [{ value: "", telegram: false, whatsapp: false }],
      seatsCount: 1,
      travelDate: new Date(),
      arrivalCityId: "",
      departureCityId: "",
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const direction = routeData?.routeByIds?.direction as RouteDirection;

        const { phones, ...rest } = value;

        const {
          value: mainPhoneNumber,
          telegram: mainTelegram,
          whatsapp: mainWhatsapp,
        } = phones[0];

        // optional phone
        const {
          value: extraPhoneNumber,
          telegram: extraTelegram,
          whatsapp: extraWhatsapp,
        } = phones[1] || [];

        const payload: CreateBookingInput = {
          ...rest,
          travelDate: value.travelDate,
          phoneNumber: mainPhoneNumber,
          telegram: mainTelegram,
          whatsapp: mainWhatsapp,
          extraPhoneNumber,
          extraTelegram,
          extraWhatsapp,
          direction,
          telegramId: initDataState?.user?.id,
        };

        await createBooking({ input: payload });
        formApi.reset();
      } catch (error) {
        console.error("Error while creating booking:", error);
      }
    },
  });

  const departureCityId = useStore(
    form.store,
    (state) => state.values.departureCityId,
  );
  const arrivalCityId = useStore(
    form.store,
    (state) => state.values.arrivalCityId,
  );

  const { data: routeData } = useRouteByIds({
    arrivalCityId,
    departureCityId,
    options: {
      enabled: !!arrivalCityId && !!departureCityId,
    },
  });

  const route: Route = routeData?.routeByIds || null;

  // arrivalCities
  const { data: arrivalData, isLoading: arrivalIsLoading } = useArrivalCities({
    cityId: departureCityId,
    options: { enabled: !!departureCityId },
  });
  const arrivalCities = useMemo(
    () =>
      (arrivalData?.arrivalCities || []).map(({ id, name }) => ({
        label: name,
        value: id,
      })),
    [arrivalData],
  );

  // departureCities
  const { data: departureData, isPending: departureIsPending } =
    useDepartureCities();
  const departureCities = useMemo(
    () =>
      (departureData?.departureCities || []).map(({ id, name }) => ({
        label: name,
        value: id,
      })),
    [departureData],
  );

  const handleSwapCities = () => {
    if (departureCityId && arrivalCityId) {
      form.setFieldValue("departureCityId", arrivalCityId);
      form.setFieldValue("arrivalCityId", departureCityId);
      hapticFeedback.impactOccurred("light");
    }
  };

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
          <Section header="Выберите откуда вы хотите поехать и куда">
            <form.AppField
              name="departureCityId"
              validators={{
                onChange: ({ value }) => {
                  if (!value) {
                    return "Выберите город отправления";
                  }
                  return undefined;
                },
              }}
              listeners={{
                onChange: () => {
                  form.setFieldValue("arrivalCityId", "");
                },
              }}
              children={(field) => {
                const entry = departureCities.find(
                  (city) => city.value === field.state.value,
                ) as NonNullable<{ label: string; value: string }>;

                return (
                  <field.MultiselectField
                    before={
                      departureIsPending && (
                        <Loader2 className="text-(color:--tg-theme-accent-text-color) animate-spin ml-2" />
                      )
                    }
                    emptyText="Нет таких городов"
                    closeDropdownAfterSelect
                    placeholder="Выберите город отправления"
                    value={[entry].filter(Boolean)}
                    onChange={(options) => {
                      if (!options.length) {
                        field.handleChange("");
                      } else {
                        const lastOption = options.at(-1)!;
                        field.handleChange(lastOption.value as string);
                      }
                    }}
                    options={departureCities}
                  />
                );
              }}
            />

            {/* Consider to use form.Subscribe for checking
              `disabled={!departureCityId || !arrivalCityId}`*/}
            <div className="flex justify-center p-4">
              <Button
                before={<ArrowRightLeft className="h-4 w-4" />}
                type="button"
                mode="bezeled"
                size="l"
                onClick={handleSwapCities}
                disabled={!departureCityId || !arrivalCityId}
              >
                Поменять города местами
              </Button>
            </div>

            <form.AppField
              name="arrivalCityId"
              validators={{
                onChange: ({ value }) => {
                  if (!value) {
                    return "Выберите город прибытия";
                  }
                  return undefined;
                },
              }}
              children={(field) => {
                const entry = arrivalCities.find(
                  (city) => city.value === field.state.value,
                ) as NonNullable<{ label: string; value: string }>;

                return (
                  <field.MultiselectField
                    before={
                      arrivalIsLoading && (
                        <Loader2 className="text-(color:--tg-theme-accent-text-color) animate-spin ml-2" />
                      )
                    }
                    emptyText="Нет таких городов"
                    closeDropdownAfterSelect
                    placeholder="Выберите город прибытия"
                    value={[entry].filter(Boolean)}
                    onChange={(options) => {
                      if (!options.length) {
                        field.handleChange("");
                      } else {
                        const lastOption = options.at(-1)!;
                        field.handleChange(lastOption.value as string);
                      }
                    }}
                    options={arrivalCities}
                    disabled={!departureCityId}
                  />
                );
              }}
            />
          </Section>

          {/* Price Banner */}
          {route && (
            <Banner
              type="section"
              className="text-center mt-2"
              header={`Цена: ${route.price} ₽`}
            />
          )}

          <Divider />

          <Section header="Личные данные">
            <form.AppField
              name="lastName"
              validators={{
                onChange: ({ value }) => {
                  if (!value.length) {
                    return "Фамилия обязательна";
                  }
                  if (value.length < 4 || value.length > 50) {
                    return "Фамилия не должна быть короче 4 символов и длиннее 50";
                  }
                  return undefined;
                },
              }}
              children={(field) => {
                const capitalizeFirstChars = (value: string) => {
                  const words = value.split(" ").filter(Boolean);
                  const capitalizedWorlds = words
                    .map((w) =>
                      w
                        .replace(/^./, (w.at(0) as string)?.toUpperCase())
                        .replace(/\d/gi, ""),
                    )

                    .join(" ");
                  return capitalizedWorlds;
                };

                return (
                  <field.TextField
                    header="Фамилия"
                    placeholder="Фамилия"
                    onChange={(e) =>
                      field.handleChange(capitalizeFirstChars(e.target.value))
                    }
                  />
                );
              }}
            />

            <form.AppField
              name="firstName"
              validators={{
                onChange: ({ value }) => {
                  if (!value.length) {
                    return "Имя обязательно";
                  }
                  if (value.length < 3 || value.length > 50) {
                    return "Имя не должно быть короче 3 символов и длиннее 50";
                  }
                  return undefined;
                },
              }}
              children={(field) => {
                const capitalizeFirstChars = (value: string) => {
                  const words = value.split(" ").filter(Boolean);
                  const capitalizedWorlds = words
                    .map((w) =>
                      w
                        .replace(/^./, (w.at(0) as string)?.toUpperCase())
                        .replace(/\d/gi, ""),
                    )

                    .join(" ");
                  return capitalizedWorlds;
                };

                return (
                  <field.TextField
                    header="Имя"
                    placeholder="Имя"
                    onChange={(e) =>
                      field.handleChange(capitalizeFirstChars(e.target.value))
                    }
                  />
                );
              }}
            />
          </Section>

          <Section header="Контактная информация">
            <form.Field
              name="phones"
              mode="array"
              children={(field) => {
                return (
                  <Fragment>
                    {field.state.value.map((_, i) => {
                      return (
                        <Fragment key={i}>
                          <form.AppField
                            name={`phones[${i}].value`}
                            validators={{
                              onChange: ({ value }) => {
                                return !isPossiblePhoneNumber(value)
                                  ? "Проверьте правильно ли ввели номер телефона"
                                  : undefined;
                              },
                            }}
                            children={(phoneField) => {
                              return (
                                <div className="relative">
                                  <phoneField.PhoneField
                                    header={
                                      i === 0 ? "Телефон" : "Доп. телефон"
                                    }
                                    placeholder="Введите номер телефона"
                                  />
                                  {i !== 0 && (
                                    <IconButton
                                      type="button"
                                      className="flex items-center justify-center absolute! top-3 right-3 [&_svg]:size-4 z-10"
                                      size="s"
                                      mode="bezeled"
                                      onClick={() => field.removeValue(i)}
                                    >
                                      <X />
                                      <span className="sr-only">
                                        Удалить телефон
                                      </span>
                                    </IconButton>
                                  )}

                                  <div className="flex justify-center flex-wrap gap-4 py-2 pb-4">
                                    <form.Field
                                      name={`phones[${i}].telegram`}
                                      children={(telegramField) => {
                                        return (
                                          <div className="flex items-center gap-2 min-w-0">
                                            <Checkbox
                                              id={telegramField.name}
                                              checked={
                                                telegramField.state.value
                                              }
                                              onChange={(e) =>
                                                telegramField.handleChange(
                                                  e.target.checked,
                                                )
                                              }
                                            />
                                            <Label
                                              className="cursor-pointer"
                                              htmlFor={telegramField.name}
                                            >
                                              Telegram
                                            </Label>
                                          </div>
                                        );
                                      }}
                                    />

                                    <form.Field
                                      name={`phones[${i}].whatsapp`}
                                      children={(whatsappField) => {
                                        return (
                                          <div className="flex items-center gap-2 min-w-0">
                                            <Checkbox
                                              id={whatsappField.name}
                                              checked={
                                                whatsappField.state.value
                                              }
                                              onChange={(e) =>
                                                whatsappField.handleChange(
                                                  e.target.checked,
                                                )
                                              }
                                            />
                                            <Label
                                              className="cursor-pointer"
                                              htmlFor={whatsappField.name}
                                            >
                                              WhatsApp
                                            </Label>
                                          </div>
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            }}
                          />
                        </Fragment>
                      );
                    })}

                    {field.state.value.length <= 1 && (
                      <div className="flex justify-center py-2">
                        <Button
                          type="button"
                          mode="bezeled"
                          size="l"
                          onClick={() =>
                            field.pushValue({
                              value: "",
                              telegram: false,
                              whatsapp: false,
                            })
                          }
                        >
                          Добавить телефон
                        </Button>
                      </div>
                    )}
                  </Fragment>
                );
              }}
            />
          </Section>

          <Section header="Детали поездки">
            <form.AppField
              name="travelDate"
              validators={{
                onChange: ({ value }) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const selectedDate = new Date(value);
                  selectedDate.setHours(0, 0, 0, 0);

                  // Validate that the date is today or in the future
                  if (selectedDate < today) {
                    return "Выберите сегодняшнюю или будущую дату!";
                  }

                  return undefined;
                },
              }}
              children={(field) => (
                <div className="mt-4 p-4">
                  <field.CalendarField label="Желаемая дата поездки" />
                </div>
              )}
            />

            <form.Field
              name="seatsCount"
              children={(field) => {
                const error = field.state.meta.errors.length > 0;

                return (
                  <div className={cn("flex items-center justify-center p-4")}>
                    <IconButton
                      type="button"
                      mode="bezeled"
                      size="l"
                      onClick={() =>
                        field.handleChange(() => field.state.value - 1)
                      }
                      disabled={field.state.value <= 1}
                      tabIndex={-1}
                    >
                      <Minus className="h-6 w-6" />
                      <span className="sr-only">Уменьшить</span>
                    </IconButton>

                    <div className="text-center flex-2 shrink-0 flex-grow sm:flex-none sm:px-6">
                      <NumericFormat
                        displayType="text"
                        value={field.state.value || 0}
                        className={cn(
                          "bg-transparent focus:outline-none focus:ring-1 focus:ring-ring",
                          "text-3xl sm:text-4xl font-bold tracking-tighter text-center w-full",
                          error && "text-destructive",
                        )}
                      />
                      <div
                        className={cn(
                          "whitespace-nowrap shrink-0 px-2 text-[0.70rem] sm:text-sm uppercase text-muted-foreground",
                          error && "text-destructive",
                        )}
                      >
                        Кол-во мест
                      </div>
                    </div>

                    <IconButton
                      type="button"
                      mode="bezeled"
                      size="l"
                      onClick={() =>
                        field.handleChange(() => field.state.value + 1)
                      }
                      disabled={field.state.value >= 20}
                      tabIndex={-1}
                    >
                      <Plus className="h-6 w-6" />
                      <span className="sr-only">Увеличить</span>
                    </IconButton>
                  </div>
                );
              }}
            />
          </Section>

          <Section className="p-4 bg-background">
            <form.AppForm>
              <form.SubscribeButton
                className="w-full"
                type="submit"
                size="l"
                mode="filled"
                label="Забронировать"
              />
            </form.AppForm>
          </Section>
        </form>
      </List>
    </Page>
  );
};
