import { useFieldContext } from "@/hooks/form-context";
import { Textarea } from "@telegram-apps/telegram-ui";
import { ComponentProps, FC } from "react";
import { FormMessage } from "../ui/form";

type TextareaFieldProps = ComponentProps<typeof Textarea>;

const TextareaField: FC<TextareaFieldProps> = (props) => {
  const field = useFieldContext<string>();
  const error = field.state.meta.errors.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <Textarea
        {...(error ? { status: "error" } : {})}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FormMessage />
    </div>
  );
};

export default TextareaField;
