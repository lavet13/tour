import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils'; // Ensure this utility is available for class name composition
import { buttonVariants } from '@/components/ui/button';
import { cva, VariantProps } from 'class-variance-authority';

const formButtonVariants = cva(
  "group relative w-full overflow-hidden tracking-tighter transform-gpu transition-all ease-out hover:ring-2 hover:ring-offset-2",
  {
    variants: {
      variant: {
        default: "hover:ring-primary",
        destructive:
          "hover:ring-destructive",
        outline:
          "hover:ring-accent",
        secondary:
          "hover:ring-secondary",
        ghost: "hover:ring-accent",
        link: "hover:ring-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const FormButton = React.forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          formButtonVariants({ variant }),
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* Animated overlay */}
        <span className='absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black'></span>
        <Slottable>{children}</Slottable>
      </Comp>
    );
  },
);

FormButton.displayName = 'FormButton';

export { FormButton, type FormButtonProps };
