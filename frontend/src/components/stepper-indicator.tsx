import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Fragment } from 'react';

interface StepperIndicatorProps {
  steps: number;
  activeStep: number;
  labels?: string[];
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const StepperIndicator = ({
  steps,
  activeStep,
  labels,
  variant = 'default',
  size = 'md'
}: StepperIndicatorProps) => {
  // Size configurations
  const sizeClasses = {
    sm: {
      step: 'w-8 h-8',
      icon: 'h-4 w-4',
      separator: 'w-16',
      label: 'text-xs'
    },
    md: {
      step: 'w-10 h-10',
      icon: 'h-5 w-5',
      separator: 'w-20',
      label: 'text-sm'
    },
    lg: {
      step: 'w-12 h-12',
      icon: 'h-6 w-6',
      separator: 'w-24',
      label: 'text-base'
    }
  };

  // Render a single step
  const renderStep = (step: number) => {
    const isActive = step === activeStep;
    const isCompleted = step < activeStep;

    return (
      <div className="flex flex-col items-center">
        <div
          className={cn(
            sizeClasses[size].step,
            'flex justify-center items-center rounded-full transition-all duration-200',
            'border-2 shadow-sm',
            isCompleted && 'bg-primary border-primary text-primary-foreground',
            isActive && 'bg-primary/90 ring-2 ring-primary/90',
            !isActive && !isCompleted && 'border-muted-foreground/30 bg-muted/50',
            variant === 'outline' && isActive && 'bg-background border-primary',
          )}
        >
          {isCompleted ? (
            <Check className={cn(sizeClasses[size].icon, 'stroke-[3]')} />
          ) : (
            <span className={cn(
              "font-medium",
              isActive ? "text-background" : "text-muted-foreground"
            )}>{step}</span>
          )}
        </div>

        {labels && (
          <span
            className={cn(
              'mt-2 text-center font-medium',
              sizeClasses[size].label,
              isActive ? 'text-primary' : 'text-muted-foreground',
              isCompleted && 'text-primary/80'
            )}
          >
            {labels[step - 1]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className='flex flex-col w-full gap-2'>
      <div className='flex justify-center items-center w-full'>
        {Array.from({ length: steps }, (_, i) => i + 1).map((step, index, array) => (
          <Fragment key={step}>
            {renderStep(step)}

            {step !== array.length && (
              <div
                className={cn(
                  sizeClasses[size].separator,
                  'mx-1 h-0.5', // Thinner line (0.5 instead of 1)
                  step < activeStep ? 'bg-primary' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepperIndicator;
