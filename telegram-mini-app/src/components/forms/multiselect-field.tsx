import { Multiselect } from "@telegram-apps/telegram-ui";
import { ComponentProps, FC } from "react";
import { FormMessage } from "@/components/ui/form";
import { useFieldContext } from "@/hooks/form-context";

type MultiselectFieldProps = ComponentProps<typeof Multiselect>;

const MultiselectField: FC<MultiselectFieldProps> = (props) => {
  const field = useFieldContext();
  const error = field.state.meta.errors.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <Multiselect {...(error ? { status: "error" } : {})} {...props} />
      <FormMessage />
    </div>
  );
};

export default MultiselectField;
