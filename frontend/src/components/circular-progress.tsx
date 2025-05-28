import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // Something between 1 and 100
  strokeWidth: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  strokeWidth,
  ...divProps
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    if (
      containerRef.current &&
      'getBoundingClientRect' in containerRef.current
    ) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setSize(Math.min(width, height));
    }
  }, []);

  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div ref={containerRef} {...divProps}>
      {size > 0 && (
        <svg width={size} height={size} xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <radialGradient
              id='circle-progress'
              cx='0'
              cy='0'
              r='1'
              gradientUnits='userSpaceOnUse'
              gradientTransform='translate(53.1659 -18.1884) rotate(51.1683) scale(267.012 282.957)'
            >
              <stop stopColor='currentColor' />
              <stop offset='1' stopColor='currentColor' />
            </radialGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeLinecap='round'
            className='fill-none stroke-neutral-300'
            style={{
              strokeWidth,
              strokeDasharray: circumference,
              strokeDashoffset: circumference,
            }}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeLinecap='round'
            className='fill-none'
            style={{ stroke: 'url(#circle-progress)', strokeWidth }}
            initial={{
              strokeDashoffset: circumference,
              strokeDasharray: circumference,
            }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              ease: 'easeOut',
            }}
          />
        </svg>
      )}
    </div>
  );
};

export default CircularProgress;
