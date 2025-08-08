import { CenteredContent } from "@/components/CenteredContent";
import { Page } from "@/components/Page";
import {
  useArrivalCities,
  useDepartureCities,
  useRouteByIds,
} from "@/features/create-booking/queries";
import { useStore } from "@tanstack/react-form";
import {
  Button,
  Checkbox,
  Headline,
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
import { Label } from "@/components/ui/label";
import {
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';

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
    }
  };

  return (
    <Page>
      <List>
        <Section header="Выберите откуда вы хотите поехать и куда">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="relative grid gap-2">
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
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-1 block">
                <IconButton
                  type="button"
                  mode="bezeled"
                  size="s"
                  className="mt-0.5 inline-flex items-center justify-center size-10"
                  onClick={handleSwapCities}
                  disabled={!departureCityId || !arrivalCityId}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  <span className="sr-only">Поменять города местами</span>
                </IconButton>
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
            </div>

            {route && (
              <Headline className="text-center" weight="3">
                Цена: {route.price} ₽
              </Headline>
            )}

            <div className="relative grid gap-2">
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

              <form.Field
                name="phones"
                mode="array"
                children={(field) => {
                  return (
                    <>
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
                                  </div>
                                );
                              }}
                            />

                            <CenteredContent className="flex-wrap gap-x-4 gap-y-2">
                              <form.Field
                                name={`phones[${i}].telegram`}
                                children={(telegramField) => {
                                  return (
                                    <div className="flex items-center gap-x-3">
                                      <Label
                                        className="cursor-pointer"
                                        htmlFor={telegramField.name}
                                      >
                                        Telegram
                                      </Label>
                                      <Checkbox
                                        id={telegramField.name}
                                        checked={telegramField.state.value}
                                        onChange={(e) =>
                                          telegramField.handleChange(
                                            e.target.checked,
                                          )
                                        }
                                      />
                                    </div>
                                  );
                                }}
                              />

                              <form.Field
                                name={`phones[${i}].whatsapp`}
                                children={(whatsappField) => {
                                  return (
                                    <div className="flex items-center gap-x-3">
                                      <Label
                                        className="cursor-pointer"
                                        htmlFor={whatsappField.name}
                                      >
                                        Whatsapp
                                      </Label>
                                      <Checkbox
                                        id={whatsappField.name}
                                        checked={whatsappField.state.value}
                                        onChange={(e) =>
                                          whatsappField.handleChange(
                                            e.target.checked,
                                          )
                                        }
                                      />
                                    </div>
                                  );
                                }}
                              />
                            </CenteredContent>
                          </Fragment>
                        );
                      })}

                      <CenteredContent className="py-4">
                        <Button
                          mode="bezeled"
                          size="s"
                          disabled={field.state.value.length > 1}
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
                      </CenteredContent>
                    </>
                  );
                }}
              />

              <CenteredContent>
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
                    <field.CalendarField label="Желаемая дата поездки" />
                  )}
                />
              </CenteredContent>
              <CenteredContent>
                <form.Field
                  name="seatsCount"
                  children={(field) => {
                    const error = field.state.meta.errors.length > 0;

                    return (
                      <div
                        className={cn(
                          "flex items-center justify-center",
                          field.state.value === 0 && "text-muted-foreground",
                          "focus:outline-none focus:ring-1 focus:ring-ring",
                        )}
                      >
                        <Button
                          mode="bezeled"
                          size="s"
                          className={cn(
                            "min-h-10 min-w-12 h-14 w-24 flex-1 sm:flex-none shrink-0 rounded-full",
                          )}
                          type="button"
                          onClick={() =>
                            field.handleChange(() => field.state.value - 1)
                          }
                          disabled={field.state.value <= 1}
                          tabIndex={-1}
                        >
                          <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="sr-only">Уменьшить</span>
                        </Button>
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
                        <Button
                          mode="bezeled"
                          size="s"
                          className={cn(
                            "min-h-10 min-w-12 h-14 w-24 flex-1 sm:flex-none shrink-0 rounded-full",
                          )}
                          type="button"
                          onClick={() =>
                            field.handleChange(() => field.state.value + 1)
                          }
                          disabled={field.state.value >= 20}
                          tabIndex={-1}
                        >
                          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="sr-only">Увеличить</span>
                        </Button>
                      </div>
                    );
                  }}
                />
              </CenteredContent>
            </div>
            <CenteredContent className="py-4">
              <form.AppForm>
                <form.SubscribeButton
                  type="submit"
                  mode="filled"
                  label="Забронировать"
                />
              </form.AppForm>
            </CenteredContent>
          </form>
        </Section>
      </List>
    </Page>
  );
};
