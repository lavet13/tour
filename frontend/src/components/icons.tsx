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
  phoenix: ({ className, ...props }: IconProps) => (
    <svg
      className={cn('w-full h-full', className)}
      viewBox='0 0 474 475'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      {/* Main circle background using zinc-900 from shadcn */}
      <circle
        cx='236.229'
        cy='237.334'
        r='236.006'
        fill='hsl(var(--foreground))'
      />

      {/* Inner shape using background gradient from zinc-50 to zinc-200 */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='m 236.224,412.477 c 96.728,0 175.142,-78.414 175.142,-175.142 0,-96.728 -78.414,-175.1412 -175.142,-175.1412 -96.728,0 -175.1415,78.4132 -175.1415,175.1412 0,31.127 8.1199,60.357 22.357,85.688 v 52.191 c 0,6.86 5.5613,12.421 12.4214,12.421 h 50.3981 c 26.294,15.774 57.071,24.842 89.965,24.842 z'
        fill='url(#paint0_linear)'
      />

      {/* Sound wave bars using zinc-700 */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M 283.427,306.896 V 166.534 c 0,-10.29 8.342,-18.632 18.632,-18.632 10.29,0 18.632,8.342 18.632,18.632 v 140.362 c 0,10.29 -8.342,18.632 -18.632,18.632 -10.29,0 -18.632,-8.342 -18.632,-18.632 z m -65.845,-0.002 V 201.933 c 0,-10.29 8.342,-18.632 18.632,-18.632 10.291,0 18.633,8.342 18.633,18.632 v 104.961 c 0,10.29 -8.342,18.632 -18.633,18.632 -10.29,0 -18.632,-8.342 -18.632,-18.632 z m -28.564,-60.867 c 0,-10.291 -8.342,-18.633 -18.632,-18.633 -10.29,0 -18.632,8.342 -18.632,18.633 v 61.485 c 0,10.291 8.342,18.632 18.632,18.633 10.29,0 18.632,-8.342 18.632,-18.633 z'
        fill='hsl(var(--foreground))'
      />

      <defs>
        <linearGradient
          id='paint0_linear'
          x1='236.224'
          y1='76.193802'
          x2='236.224'
          y2='426.47699'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='hsl(var(--accent))' />
          <stop offset='1' stopColor='hsl(var(--accent))' />
        </linearGradient>
      </defs>
    </svg>
  ),
  whatsapp: ({ className, ...props }: IconProps) => (
    <svg
      className={cn('w-full h-full', className)}
      version='1.1'
      id='Layer_1'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 308 308'
      fill='none'
      stroke='currentColor'
      {...props}
    >
      <g id='XMLID_468_'>
        <path
          id='XMLID_469_'
          d='M227.904,176.981c-0.6-0.288-23.054-11.345-27.044-12.781c-1.629-0.585-3.374-1.156-5.23-1.156
		c-3.032,0-5.579,1.511-7.563,4.479c-2.243,3.334-9.033,11.271-11.131,13.642c-0.274,0.313-0.648,0.687-0.872,0.687
		c-0.201,0-3.676-1.431-4.728-1.888c-24.087-10.463-42.37-35.624-44.877-39.867c-0.358-0.61-0.373-0.887-0.376-0.887
		c0.088-0.323,0.898-1.135,1.316-1.554c1.223-1.21,2.548-2.805,3.83-4.348c0.607-0.731,1.215-1.463,1.812-2.153
		c1.86-2.164,2.688-3.844,3.648-5.79l0.503-1.011c2.344-4.657,0.342-8.587-0.305-9.856c-0.531-1.062-10.012-23.944-11.02-26.348
		c-2.424-5.801-5.627-8.502-10.078-8.502c-0.413,0,0,0-1.732,0.073c-2.109,0.089-13.594,1.601-18.672,4.802
		c-5.385,3.395-14.495,14.217-14.495,33.249c0,17.129,10.87,33.302,15.537,39.453c0.116,0.155,0.329,0.47,0.638,0.922
		c17.873,26.102,40.154,45.446,62.741,54.469c21.745,8.686,32.042,9.69,37.896,9.69c0.001,0,0.001,0,0.001,0
		c2.46,0,4.429-0.193,6.166-0.364l1.102-0.105c7.512-0.666,24.02-9.22,27.775-19.655c2.958-8.219,3.738-17.199,1.77-20.458
		C233.168,179.508,230.845,178.393,227.904,176.981z'
        />
        <path
          id='XMLID_470_'
          d='M156.734,0C73.318,0,5.454,67.354,5.454,150.143c0,26.777,7.166,52.988,20.741,75.928L0.212,302.716
		c-0.484,1.429-0.124,3.009,0.933,4.085C1.908,307.58,2.943,308,4,308c0.405,0,0.813-0.061,1.211-0.188l79.92-25.396
		c21.87,11.685,46.588,17.853,71.604,17.853C240.143,300.27,308,232.923,308,150.143C308,67.354,240.143,0,156.734,0z
		 M156.734,268.994c-23.539,0-46.338-6.797-65.936-19.657c-0.659-0.433-1.424-0.655-2.194-0.655c-0.407,0-0.815,0.062-1.212,0.188
		l-40.035,12.726l12.924-38.129c0.418-1.234,0.209-2.595-0.561-3.647c-14.924-20.392-22.813-44.485-22.813-69.677
		c0-65.543,53.754-118.867,119.826-118.867c66.064,0,119.812,53.324,119.812,118.867
		C276.546,215.678,222.799,268.994,156.734,268.994z'
        />
      </g>
    </svg>
  ),
};
