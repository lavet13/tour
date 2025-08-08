import { useFieldContext } from "@/hooks/form-context";
import { cn } from "@/lib/utils";
import { ComponentProps, FC } from "react";
import { Label } from "@/components/ui/label";
import * as LabelPrimitive from "@radix-ui/react-label";

export const FormLabel: FC<ComponentProps<typeof LabelPrimitive.Root>> = ({
  className,
  id,
  ...props
}) => {
  const field = useFieldContext();
  const name = field.name;
  const hasErrors = !!field.state.meta.errors.length;

  return (
    <Label
      data-slot="form-label"
      data-error={hasErrors}
      htmlFor={id || name}
      className={cn("data-[error=true]:text-destructive-foreground", className)}
      {...props}
    />
  );
};


export const FormMessage: FC<ComponentProps<"p">> = ({
  className,
  ...props
}) => {
  const field = useFieldContext();
  const hasErrors = !!field.state.meta.errors.length;
  const errors = field.state.meta.errors;

  if (!hasErrors) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      className={cn("px-[22px] text-destructive-foreground text-sm sm:text-xs", className)}
      {...props}
    >
      {errors.join(", ")}
    </p>
  );
};

