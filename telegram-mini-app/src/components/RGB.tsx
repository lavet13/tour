import type { RGB as RGBType } from "@telegram-apps/sdk-react";
import type { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

export type RGBProps = ComponentProps<"div"> & {
  color: RGBType;
};

export const RGB: FC<RGBProps> = ({ color, className, ...props }) => (
  <span
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  >
    <i
      className={"w-[18px] aspect-square border border-gray-600 rounded-full"}
      style={{ backgroundColor: color }}
    />
    {color}
  </span>
);
