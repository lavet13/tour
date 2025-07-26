import { CenteredContent } from "@/components/CenteredContent";
import { Page } from "@/components/Page";
import {
  useArrivalCities,
  useDepartureCities,
} from "@/features/create-booking/queries";
import { useForm, useStore } from "@tanstack/react-form";
import {
  Button,
  IconButton,
  List,
  Multiselect,
  Section,
} from "@telegram-apps/telegram-ui";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { FC, useMemo } from "react";

export const BookingPage: FC = () => {
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phones: [{ value: "", telegram: false, whatsapp: false }],
      seatsCount: 1,
      travelDate: null,
      arrivalCityId: "",
      departureCityId: "",
    },
    onSubmit: async ({ value, meta }) => {
      console.log({ value, meta });
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
    const departureCityId = form.getFieldValue("departureCityId");
    const arrivalCityId = form.getFieldValue("arrivalCityId");

    if (departureCityId && arrivalCityId) {
      form.setFieldValue("departureCityId", arrivalCityId);
      form.setFieldValue("arrivalCityId", departureCityId);
    }
  };

  import.meta.env.DEV && console.log({ arrivalCities, departureCities });

  return (
    <Page back={false}>
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
              <form.Field
                name="departureCityId"
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
                    <Multiselect
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

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-1 block">
                <IconButton
                  type="button"
                  mode="bezeled"
                  size="s"
                  className="inline-flex items-center justify-center size-10"
                  onClick={handleSwapCities}
                  disabled={!departureCityId || !arrivalCityId}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  <span className="sr-only">Поменять города местами</span>
                </IconButton>
              </div>

              <form.Field
                name="arrivalCityId"
                children={(field) => {
                  const entry = arrivalCities.find(
                    (city) => city.value === field.state.value,
                  ) as NonNullable<{ label: string; value: string }>;

                  return (
                    <Multiselect
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
            <CenteredContent className="py-2">
              <Button type="submit" mode="filled" size="m">
                Зарегистрировать
              </Button>
            </CenteredContent>
          </form>
        </Section>
      </List>
    </Page>
  );
};
