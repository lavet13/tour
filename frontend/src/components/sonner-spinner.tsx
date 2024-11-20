import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SonnerSpinnerProps
  extends React.InputHTMLAttributes<HTMLDivElement> {
  scale?: string | number;
}

const SonnerSpinner = React.forwardRef<HTMLDivElement, SonnerSpinnerProps>(
  ({ className, scale = 1 }, ref) => {
    const bars = Array(12).fill(null);

    return (
      <div
        className={`inline-flex h-4 w-4 relative`}
        style={{ transform: `scale(${scale})` }}
        ref={ref}
      >
        <div className='absolute top-1/2 left-1/2 h-4 w-4'>
          {bars.map((_, i) => (
            <div
              key={`spinner-bar-${i}`}
              className={cn(
                'absolute h-[8%] w-[24%] bg-background rounded-md animate-sonner-spin',
                className,
              )}
              style={{
                animationDelay: `${-1.2 + i * 0.1}s`,
                transform: `rotate(${i * 30}deg) translate(146%)`,
              }}
            />
          ))}
        </div>
      </div>
    );
  },
);

export { SonnerSpinner };
