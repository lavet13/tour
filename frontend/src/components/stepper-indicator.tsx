import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Fragment } from 'react';

interface StepperIndicatorProps {
  steps: number;
  activeStep: number;
}

const StepperIndicator = ({ steps, activeStep }: StepperIndicatorProps) => {
  return (
    <div className='flex justify-center items-center'>
      {Array.from({ length: steps }, (_v, i) => i + 1).map((step, _i, steps) => (
        <Fragment key={step}>
          <div
            className={cn(
              'w-[40px] h-[40px] flex justify-center items-center m-[5px] border-[2px] rounded-full',
              step < activeStep && 'bg-background text-white',
              step === activeStep && 'border',
            )}
          >
            {step >= activeStep ? step : <Check className='h-5 w-5' />}
          </div>
          {step !== steps.length && (
            <Separator
              orientation='horizontal'
              className={cn(
                'w-[100px] h-[2px]',
                step <= activeStep - 1 && 'bg-primary',
              )}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default StepperIndicator;
