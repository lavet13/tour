import { useFormContext } from "@/hooks/form-context";
import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";
import { Button } from "@telegram-apps/telegram-ui";
import { Loader2 } from "lucide-react";

const SubscribeButton: FC<
  ComponentProps<typeof Button> & { label: string; loadingMessage?: string }
> = ({ className, label, loadingMessage = "Подтверждается", ...props }) => {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [
        state.canSubmit,
        state.isSubmitting,
        state.isDefaultValue,
      ]}
      children={([canSubmit, isSubmitting, isDefaultValue]) => (
        <Button
          before={isSubmitting && <Loader2 className="animate-spin" />}
          type="submit"
          disabled={!canSubmit || isDefaultValue}
          className={cn("items-center justify-center inline-flex", className)}
          {...props}
        >
          {isSubmitting ? <>Подтверждается</> : <>{label}</>}
        </Button>
      )}
    />
  );
};

export default SubscribeButton;
