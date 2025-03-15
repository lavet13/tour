import { Suspense } from "react";
import { useImage } from "react-image";
import { SonnerSpinner } from "./sonner-spinner";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string; // The primary image URL
  fallbackSrc: string; // URL for the fallback image if the primary fails
}

function LazyImage({ src, fallbackSrc, alt, style, ...rest }: LazyImageProps) {
  const { src: loadedSrc } = useImage({
    srcList: [src, fallbackSrc], // Tries `src` first, then `fallbackSrc`
    useSuspense: true, // Suspense for waiting until the image loads
  });

  return (
    <img
      src={loadedSrc}
      alt={alt}
      style={{
        ...style,
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out',
      }}
      {...rest}
    />
  );
}

export function LazyImageWrapper({ className, ...props }: LazyImageProps) {
  return (
    <div className='relative h-48 overflow-hidden'>
      <Suspense
        fallback={
          <div
            className='flex items-center justify-center w-full h-full'
            aria-busy='true'
            aria-label='Loading image'
          >
            <SonnerSpinner className='bg-foreground' />
          </div>
        }
      >
        <LazyImage
          className={cn('w-full h-48 object-cover', className)}
          {...props}
        />
      </Suspense>
    </div>
  );
}
