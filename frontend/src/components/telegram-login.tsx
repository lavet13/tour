import { useAuthenticateTelegram } from '@/features/auth';
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
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { mutateAsync: authenticate, isPending } = useAuthenticateTelegram();

  const handleTelegramAuth = async (user: TelegramUser) => {
    console.log('Raw Telegram user data:', user);

    // Send the data exactly as received from Telegram
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
  };

  useEffect(() => {
    // Cleanup any existing callback
    const cleanupExistingCallback = () => {
      const existingCallbacks = Object.keys(window).filter(key =>
        key.startsWith('onTelegramAuth_')
      );
      existingCallbacks.forEach(callback => {
        delete window[callback];
      });
    };

    cleanupExistingCallback();

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
      console.log('Telegram auth callback triggered:', user);
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
    <div className="flex justify-center text-center" ref={containerRef} {...props}>
      {isPending && <Loader2 className="animate-spin" />}
    </div>
  );
};

export default TelegramLogin;
