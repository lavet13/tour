import { Loader2 } from "lucide-react";
import type { ComponentProps, FC } from "react";
import { Suspense } from "react";

type SuspendProps = ComponentProps<typeof Suspense>;

export const Suspend: FC<SuspendProps> = ({ fallback, children, ...props }) => {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center min-h-[100svh]">
            <Loader2 className="text-(color:--tg-theme-accent-text-color) animate-spin ml-2" />
          </div>
        )
      }
      {...props}
    >
      {children}
    </Suspense>
  );
};
