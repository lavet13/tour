import * as React from 'react';
import { useControllableState } from '@/hooks/use-controllable-state';
import { Cross2Icon, FileTextIcon, UploadIcon } from '@radix-ui/react-icons';
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from 'react-dropzone';
import { toast } from 'sonner';
import { cn, formatBytes } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useBreakpoint, type BreakpointValues } from '@/hooks/use-breakpoint';

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type (files: File[]) => void
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps['accept'];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps['maxSize'];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFileCount={4}
   */
  maxFileCount?: DropzoneProps['maxFiles'];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;

  /**
   * To properly focus on dropzone
   * @type (instance: any) => void
   * @default undefined
   * @example innerRef={ref}
   */
  innerRef: (instance: any) => void;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = { 'image/*': [] },
    maxSize = 1024 * 1024 * 2, // 2 MB
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    innerRef,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error('Cannot upload more than 1 file at a time');
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(`Нельзя загрузить более ${maxFileCount} файлов`);
        return;
      }

      const newFiles = acceptedFiles.map(file =>
        Object.assign(file, { preview: URL.createObjectURL(file) }),
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          console.log({ errors, file });
          toast.error(`Файл ${file.name} был отклонен`);
        });
      }

      if (
        onUpload &&
        updatedFiles.length > 0 &&
        updatedFiles.length <= maxFileCount
      ) {
        const target =
          updatedFiles.length > 0
            ? `${updatedFiles.length} файла`
            : updatedFiles.length > 1 && `файлов`;

        toast.promise(onUpload(updatedFiles), {
          loading: `Загрузка ${target}...`,
          success: () => {
            setFiles([]);
            return `${target} загружено`;
          },
          error: `Не удалось загрузить ${target}`,
        });
      }
    },
    [files, maxFileCount, multiple, onUpload, setFiles],
  );

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  }

  // Revoke preview url when component unmounts
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach(file => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;
  const fileNameLength = useBreakpoint({
    base: 17,
    sm: 45,
    md: 50,
    lg: 50,
    xl: 60,
    '2xl': 60,
  });


  return (
    <div className='relative flex flex-col gap-6'>
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFileCount}
        multiple={maxFileCount > 1 || multiple}
        disabled={isDisabled}
      >
        {({ isDragActive, getRootProps, getInputProps }) => {
          return (
            <div
              {...getRootProps()}
              className={cn(
                'group relative grid min-h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-4 sm:py-2.5 text-center transition hover:bg-muted/25',
                'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isDragActive && 'border-muted-foreground/50',
                isDisabled && 'pointer-events-none opacity-60',
                className,
              )}
              {...dropzoneProps}
              ref={innerRef}
            >
              <input {...getInputProps()} />
              <div className='select-none pointer-events-none absolute flex flex-col items-center justify-center gap-4 px-2 sm:px-5 inset-0 z-10'>
                {isDragActive ? (
                  <>
                    <div className='rounded-full border border-dashed p-3'>
                      <UploadIcon
                        className='size-5 sm:size-7 text-muted-foreground'
                        aria-hidden='true'
                      />
                    </div>
                    <p className='font-medium text-muted-foreground'>
                      Отпустите кнопку мыши, чтобы прикрепить фото
                    </p>
                  </>
                ) : (
                  <>
                    <div className='rounded-full border border-dashed p-3'>
                      <UploadIcon
                        className='size-5 sm:size-7 text-muted-foreground'
                        aria-hidden='true'
                      />
                    </div>
                    <div className='flex flex-col gap-1 sm:gap-px'>
                      <p className='text-xs sm:text-sm font-medium text-muted-foreground'>
                        Перетащите файл{maxFileCount > 1 ? 'ы' : ''} или нажмите
                        здесь для выбора {maxFileCount > 1 ? 'файлов' : 'файла'}
                      </p>
                      <p className='text-xs sm:text-sm text-muted-foreground/70'>
                        Вы можете загрузить{' '}
                        {maxFileCount > 1
                          ? ` ${maxFileCount === Infinity ? 'неограниченное количество' : maxFileCount}
                        ${maxFileCount > 4 ? 'файлов' : 'файла'} (размером до ${formatBytes(maxSize)} каждый)`
                          : `файл размером до ${formatBytes(maxSize)}`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        }}
      </Dropzone>
      {files?.length ? (
        <ScrollArea className='h-fit w-full px-3'>
          <div className='flex flex-col max-h-48 gap-4'>
            {files?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => onRemove(index)}
                progress={progresses?.[file.name]}
                fileNameLength={fileNameLength}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: number;
  fileNameLength: number;
}

function FileCard({ file, onRemove, progress, fileNameLength }: FileCardProps) {
  return (
    <div className='relative flex items-center gap-2.5'>
      <div className='flex flex-1 gap-2.5 min-w-0'>
        {isFileWithPreview(file) ? <FilePreview file={file} /> : null}
        <div className='flex w-full flex-col gap-2 min-w-0'>
          <div className='flex flex-col gap-px'>
            <FileNameFormatter
              fileName={file.name}
              maxLength={fileNameLength}
              truncatePosition='middle'
            />
            <p className='text-xs text-muted-foreground'>
              {formatBytes(file.size)}
            </p>
          </div>
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <div className='flex-shrink-0'>
        <Button
          type='button'
          variant='outline'
          size='icon'
          className='size-7'
          onClick={onRemove}
        >
          <Cross2Icon className='size-4' aria-hidden='true' />
          <span className='sr-only'>Remove file</span>
        </Button>
      </div>
    </div>
  );
}

interface FilePreviewProps {
  file: File & { preview: string };
}

function FilePreview({ file }: FilePreviewProps) {
  if (file.type.startsWith('image/')) {
    return (
      <img
        src={file.preview}
        alt={file.name}
        width='48'
        height='48'
        loading='lazy'
        className='aspect-ratio shrink-0 rounded-md object-cover'
      />
    );
  }

  return (
    <FileTextIcon
      className='size-10 text-muted-foreground'
      aria-hidden='true'
    />
  );
}

interface FileNameFormatterProps {
  /**
   * The complete filename including extension
   */
  fileName: string;
  /**
   * Maximum length of the displayed filename
   * @default 25
   */
  maxLength: number;
  /**
   * Custom truncation characters
   * @default "..."
   */
  truncationChars?: string;
  /**
   * Where to truncate the filename
   * @default "end"
   */
  truncatePosition?: 'start' | 'middle' | 'end';
  /**
   * Custom className for the container
   */
  className?: string;
}

interface FormattedFileName {
  displayName: string;
  originalName: string;
  isLong: boolean;
}

function FileNameFormatter({
  fileName,
  maxLength,
  truncationChars = '...',
  truncatePosition = 'end',
  className = '',
}: FileNameFormatterProps) {
  const formatFileName = (fullName: string): FormattedFileName => {
    if (!fullName) {
      return { displayName: '', originalName: '', isLong: false };
    }

    const lastDotIndex = fullName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return { displayName: fullName, originalName: fullName, isLong: false };
    }

    const name = fullName.slice(0, lastDotIndex);
    const extension = fullName.slice(lastDotIndex);
    const isLong = name.length + extension.length > maxLength;

    if (!isLong) {
      return { displayName: fullName, originalName: fullName, isLong: false };
    }

    const truncatedLength =
      maxLength - extension.length - truncationChars.length;

    let truncatedName: string;
    switch (truncatePosition) {
      case 'start':
        truncatedName =
          truncationChars + name.slice(-truncatedLength) + extension;
        break;
      case 'middle':
        const halfLength = Math.floor(truncatedLength / 2);
        truncatedName =
          name.slice(0, halfLength) +
          truncationChars +
          name.slice(-(truncatedLength - halfLength)) +
          extension;
        break;
      default: // 'end'
        truncatedName =
          name.slice(0, truncatedLength) + truncationChars + extension;
    }

    return {
      displayName: truncatedName,
      originalName: fullName,
      isLong: true,
    };
  };

  const formattedFile = formatFileName(fileName);

  return (
    <div
      className={`flex items-center min-w-0 max-w-full ${className}`}
      title={formattedFile.isLong ? formattedFile.originalName : undefined}
    >
      <span className='truncate text-sm font-medium text-foreground/80'>
        {formattedFile.displayName}
      </span>
    </div>
  );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string';
}
