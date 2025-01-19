import { cn } from '@/lib/utils';

type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  logo: (props: IconProps) => (
    <svg viewBox='0 0 256 256' {...props}>
      <rect width='256' height='256' fill='none'></rect>
      <line
        x1='208'
        y1='128'
        x2='128'
        y2='208'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='16'
      ></line>
      <line
        x1='192'
        y1='40'
        x2='40'
        y2='192'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='16'
      ></line>
    </svg>
  ),
  sandwitch: (props: IconProps) => (
    <svg
      strokeWidth='1.5'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M3 5H11'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M3 12H16'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M3 19H21'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  ),
  vkontakte: ({ className, ...props }: IconProps) => (
    <svg
      viewBox='0 0 50 50'
      className={cn('w-5 h-5 fill-foreground transition-colors', className)}
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path d='M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M37.72,33l-3.73-0.01 c0,0-0.08,0.01-0.21,0.01c-0.3,0-0.92-0.08-1.65-0.58c-1.31-0.91-2.56-3.17-3.55-3.17c-0.07,0-0.13,0.01-0.19,0.03 c-0.86,0.27-1.12,1.13-1.12,2.18c0,0.37-0.26,0.54-0.96,0.54h-1.93c-2.16,0-4.25-0.05-6.6-2.62c-3.46-3.79-6.7-10.53-6.7-10.53 s-0.18-0.39,0.01-0.62c0.18-0.21,0.6-0.23,0.76-0.23c0.04,0,0.06,0,0.06,0h4c0,0,0.37,0.07,0.64,0.27c0.23,0.17,0.35,0.48,0.35,0.48 s0.68,1.32,1.53,2.81c1.43,2.46,2.2,3.28,2.75,3.28c0.09,0,0.18-0.02,0.27-0.07c0.82-0.45,0.58-4.09,0.58-4.09s0.01-1.32-0.42-1.9 c-0.33-0.46-0.96-0.59-1.24-0.63c-0.22-0.03,0.14-0.55,0.62-0.79c0.62-0.3,1.65-0.36,2.89-0.36h0.6c1.17,0.02,1.2,0.14,1.66,0.25 c1.38,0.33,0.91,1.62,0.91,4.71c0,0.99-0.18,2.38,0.53,2.85c0.05,0.03,0.12,0.05,0.21,0.05c0.46,0,1.45-0.59,3.03-3.26 c0.88-1.52,1.56-3.03,1.56-3.03s0.15-0.27,0.38-0.41c0.22-0.13,0.22-0.13,0.51-0.13h0.03c0.32,0,3.5-0.03,4.2-0.03h0.08 c0.67,0,1.28,0.01,1.39,0.42c0.16,0.62-0.49,1.73-2.2,4.03c-2.82,3.77-3.14,3.49-0.8,5.67c2.24,2.08,2.7,3.09,2.78,3.22 C39.68,32.88,37.72,33,37.72,33z'></path>
    </svg>
  ),
  telegram: ({ className, ...props }: IconProps) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 333334 333334'
      shapeRendering='geometricPrecision'
      textRendering='geometricPrecision'
      imageRendering='optimizeQuality'
      fillRule='evenodd'
      clipRule='evenodd'
      className={cn(
        'w-[18px] h-[18px] fill-foreground transition-colors',
        className,
      )}
      {...props}
    >
      <path d='M166667 0c92048 0 166667 74619 166667 166667s-74619 166667-166667 166667S0 258715 0 166667 74619 0 166667 0zm80219 91205l-29735 149919s-4158 10396-15594 5404l-68410-53854s76104-68409 79222-71320c3119-2911 2079-3534 2079-3534 207-3535-5614 0-5614 0l-100846 64043-42002-14140s-6446-2288-7069-7277c-624-4992 7277-7694 7277-7694l166970-65498s13722-6030 13722 3951zm-87637 122889l-27141 24745s-2122 1609-4443 601l5197-45965 26387 20619z' />
    </svg>
  ),
  fallback: ({ className, ...props }: IconProps) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      className={cn('w-full h-full', className)}
      fill='none'
      stroke='currentColor'
      {...props}
    >
      <rect
        width='20'
        height='20'
        x='2'
        y='2'
        rx='2'
        strokeWidth='1.5'
        className='fill-muted stroke-muted-foreground'
      />
      <circle cx='8.5' cy='8.5' r='1.5' className='fill-muted-foreground' />
      <path
        d='M20.4 14.5L16 10 8 18'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='stroke-muted-foreground'
      />
    </svg>
  ),
};
