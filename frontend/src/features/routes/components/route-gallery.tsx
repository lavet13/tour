import { Button } from '@/components/ui/button';
import {
  DrawerContent,
  DrawerHeader,
  DrawerNestedRoot,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { FC, useMemo, useState } from 'react';
import { useRoutesGallery } from '../api/queries';
import { SonnerSpinner } from '@/components/sonner-spinner';
import { Buffer } from 'buffer';
import { PonyfillFile } from '@/types/file-types';
import { LazyImageWrapper } from '@/components/lazy-image';
import { useFormContext } from 'react-hook-form';
import { RouteFormValues } from './route-form.schema';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn } from '@/lib/utils';

type RouteGalleryProps<T extends string> = {
  drawerMode: T;
  departureCityName: string;
  arrivalCityName: string;
  value?: boolean;
  onValueChange?: (isSelected: boolean) => void;
};

export type Image = {
  name: string;
  type: string;
  encoding: string;
  _size: number | null;
  imageUrl: string;
  buffer: Buffer;
  lastModified: number;
};

type PreviewFile = File & {
  preview: string;
};

const RoutesGallery: FC<
  RouteGalleryProps<'addRoute' | 'editRoute' | 'idle'>
> = ({
  drawerMode,
  departureCityName,
  arrivalCityName,
  value: valueProp,
  onValueChange,
}) => {
  const [_isSelected, setIsSelected] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });
  const form = useFormContext<RouteFormValues>();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 5;

  const handleSelect = (image: Image) => {
    const selectedImage = new File([image.buffer], image.name, {
      type: image.type,
      lastModified: image.lastModified,
    }) as PreviewFile;

    selectedImage.preview = image.imageUrl;

    form.setValue('photo', [selectedImage], {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    setIsSelected(true);
    setOpen(false);
  };

  const {
    data,
    isError,
    error,
    isPending,
    isPlaceholderData,
    isFetching,
    isSuccess,
  } = useRoutesGallery({
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
    options: { enabled: !!open },
  });

  const totalCount = useMemo(() => data?.routesGallery.totalCount ?? 0, [data]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const images: Image[] = useMemo(() => {
    const gallery = (data?.routesGallery.images ?? []) as PonyfillFile[];

    return gallery.map(
      ({ name, lastModified, type, encoding, _size, blobParts }) => {
        const buffer = Buffer.from(blobParts);
        const image = new Blob([buffer], { type });
        const imageUrl = URL.createObjectURL(image);

        return {
          name,
          type,
          encoding,
          _size,
          imageUrl,
          buffer,
          lastModified,
        };
      },
    );
  }, [data]);

  return (
    <DrawerNestedRoot open={open} onOpenChange={open => setOpen(open)}>
      <DrawerTrigger asChild>
        <Button
          onClick={() => setOpen(!open)}
          className='w-full col-span-full'
          variant='outline'
        >
          <Images /> Выбрать фотографию из каталога
        </Button>
      </DrawerTrigger>
      <DrawerContent className='max-w-4xl'>
        <DrawerHeader className='pt-4 pb-2 md:pt-4 md:pb-2 md:px-5 flex flex-wrap items-center gap-2'>
          <DrawerTitle className='flex-1 space-y-2.5'>
            <span className='flex justify-center flex-wrap gap-2'>
              Фотографии маршрутов
            </span>
            <span className='flex flex-col items-center justify-center text-sm font-normal text-muted-foreground'>
              Выберите фотографию для маршрута
              <div className='flex items-center gap-1'>
                {drawerMode === 'editRoute' && (
                  <>
                    <span>{departureCityName}</span>⇆
                    <span>{arrivalCityName}</span>
                  </>
                )}
              </div>
            </span>
          </DrawerTitle>
        </DrawerHeader>
        <Separator className='mt-2 mb-4' />
        <div className='container px-4 pb-4'>
          {isPending ? (
            <div className='w-full flex items-center justify-center py-12'>
              <SonnerSpinner className='bg-foreground' />
            </div>
          ) : isError ? (
            <div className='text-center py-8 text-muted-foreground'>
              {error?.message}
            </div>
          ) : images.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              Нет доступных фотографий
            </div>
          ) : (
            <div
              className={cn(
                'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
                isFetching && isSuccess && 'opacity-80',
              )}
            >
              {images.map(image => (
                <GalleryPhoto
                  key={image.imageUrl}
                  image={image}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className='flex justify-center items-center mt-6 gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(p => Math.max(p - 1, 0))}
                disabled={page === 0}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-sm'>
                {page + 1} / {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || isPlaceholderData}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </DrawerNestedRoot>
  );
};

interface GalleryPhotoProps {
  image: Image;
  onSelect: (image: Image) => void;
}

function GalleryPhoto({ image, onSelect }: GalleryPhotoProps) {
  console.log({ image });

  return (
    <div
      title={image.name}
      className={`flex flex-col relative cursor-pointer border rounded-md overflow-hidden sm:aspect-video transition-all`}
      onClick={() => onSelect(image)}
    >
      <LazyImageWrapper
        className='object-cover basis-2'
        src={image.imageUrl}
        fallbackSrc='/placeholder.svg'
        alt={image.name}
      />
      <div className='absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-white text-xs truncate'>
        {image.name}
      </div>
    </div>
  );
}

export default RoutesGallery;
