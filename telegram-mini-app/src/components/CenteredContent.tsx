import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

type CenteredContentProps = ComponentProps<"div">;

export const CenteredContent: FC<CenteredContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </div>
  );
};
