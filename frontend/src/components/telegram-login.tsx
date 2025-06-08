import { useAuthenticateTelegram, useGetMe, useLogout } from '@/features/auth';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

type TelegramLoginProps = {
  botName: string;
  buttonSize: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  canSendMessages?: boolean;
  showUserPhoto?: boolean;
} & React.ComponentProps<'div'>;

const TelegramLogin: FC<TelegramLoginProps> = ({
  botName,
  buttonSize = 'large',
  cornerRadius,
  canSendMessages = false,
  showUserPhoto = true,
  className,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { mutateAsync: authenticate, isPending } = useAuthenticateTelegram();
  const { refetch: refetchUser } = useGetMe();

  const handleTelegramAuth = async (user: TelegramUser) => {
    console.log('Raw Telegram user data:', user);

    // The auth_date should be a Unix timestamp (number of seconds since epoch)
    await authenticate({
      input: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        auth_date: user.auth_date * 1000, // Keep as Unix timestamp
        hash: user.hash,
      },
    });
    await refetchUser();
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);

    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius.toString());
    }

    if (canSendMessages) {
      script.setAttribute('data-request-access', 'write');
    }

    if (showUserPhoto) {
      script.setAttribute('data-userpic', 'true');
    }

    // Create a unique callback name
    const callbackName = `onTelegramAuth_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Define the callback function
    (window as any)[callbackName] = (user: TelegramUser) => {
      handleTelegramAuth(user);
    };

    script.setAttribute('data-onauth', `${callbackName}(user)`);

    if (containerRef.current) {
      // Clear any existing content
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (containerRef.current?.contains(script)) {
        containerRef.current.removeChild(script);
      }
      delete (window as any)[callbackName];
    };
  }, [botName, buttonSize, cornerRadius, canSendMessages, showUserPhoto]);

  return (
    <>
      <div
        className={cn('flex justify-center text-center', className)}
        ref={containerRef}
        {...props}
      ></div>
      {isPending && (
        <div className='flex justify-center absolute w-full h-full left-[50%] translate-y-6 -translate-x-[50%] opacity-80'>
          <Loader2 className='animate-spin size-4' />
        </div>
      )}
    </>
  );
};

export default TelegramLogin;
