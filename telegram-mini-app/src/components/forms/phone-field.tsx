import { ComponentProps, FC } from "react";
import { FormMessage } from "../ui/form";
import { Input } from "@telegram-apps/telegram-ui";
import RPNInput from "react-phone-number-input/input";
import ru from "react-phone-number-input/locale/ru.json";
import { useFieldContext } from "@/hooks/form-context";

type PhoneFieldProps = ComponentProps<typeof Input>;

const PhoneField: FC<PhoneFieldProps> = (props) => {
  const field = useFieldContext<string>();
  const error = field.state.meta.errors.length > 0;

  return (
    <div>
      <RPNInput
        {...props}
        {...(error ? { status: "error" } : {})}
        id={field.name}
        inputComponent={Input}
        country={"RU"}
        international
        withCountryCallingCode
        labels={ru}
        name={field.name}
        value={field.state.value}
        onChange={(value) => field.handleChange(value || "")}
      />
      <FormMessage />
    </div>
  );
};

export default PhoneField;
