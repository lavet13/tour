import type { FC } from "react";
import { FormMessage } from "@/components/ui/form";
import { useFieldContext } from "@/hooks/form-context";
import { Input } from "@telegram-apps/telegram-ui";

type TextFieldProps = React.ComponentProps<typeof Input>;

const TextField: FC<TextFieldProps> = (props) => {
  const field = useFieldContext<string>();
  const error = field.state.meta.errors.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <Input
        {...(error ? { status: "error" } : {})}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FormMessage />
    </div>
  );
};

export default TextField;
