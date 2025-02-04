import React, { useRef, useEffect, forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn } from '@/lib/utils';

interface ExpandableTextareaProps extends React.ComponentProps<typeof Textarea> {
  value?: any;
  onValueChange?: (value: any) => void;
}

export const ExpandableTextarea = forwardRef<
  HTMLTextAreaElement,
  ExpandableTextareaProps
>(({ value: valueProp, onValueChange, style, className, ...rest }, ref) => {
  const [value, setValue] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Set height to a base value first
      textareaRef.current.style.height = 'auto';
      // Adjust to scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  return (
    <Textarea
      ref={r => {
        // Combine the external ref with our internal ref
        if (typeof ref === 'function') {
          ref(r);
        } else if (ref) {
          ref.current = r;
        }
        textareaRef.current = r;
      }}
      value={value}
      onChange={handleChange}
      className={cn('w-full resize-none overflow-hidden', className)}
      style={{ minHeight: '80px', ...style }} // Set a minimum height
      {...rest}
    />
  );
});

ExpandableTextarea.displayName = 'ExpandableTextarea';
