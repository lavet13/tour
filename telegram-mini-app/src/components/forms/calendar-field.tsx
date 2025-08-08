import type { ComponentProps, FC } from "react";
import { useFieldContext } from "@/hooks/form-context";
import { FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { ru as calendarLocale } from "date-fns/locale";
import { DayPicker } from "react-day-picker";

type CalendarFieldProps = ComponentProps<typeof DayPicker> & {
  label: string;
};

const CalendarField: FC<CalendarFieldProps> = ({ label, ...props }) => {
  const field = useFieldContext<Date>();

  return (
    <div className="w-full text-center px-3 flex flex-col items-center gap-0.5">
      <FormLabel className="justify-center">{label}</FormLabel>
      <Calendar
        {...props}
        required
        locale={calendarLocale}
        selected={field.state.value}
        onSelect={field.handleChange}
        mode="single"
      />
      <FormMessage />
    </div>
  );
};

export default CalendarField;
