import { Select } from "@telegram-apps/telegram-ui";
import { ComponentProps, FC } from "react";
import { FormMessage } from "../ui/form";
import { useFieldContext } from "@/hooks/form-context";

type SelectFieldProps = ComponentProps<typeof Select>;

const SelectField: FC<SelectFieldProps> = (props) => {
  const field = useFieldContext<string>();
  const error = field.state.meta.errors.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <Select
        {...(error ? { status: "error" } : {})}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FormMessage />
    </div>
  );
};

export default SelectField;
