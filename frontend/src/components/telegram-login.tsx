import { useAuthenticateTelegram } from '@/features/auth';
import { Loader2 } from 'lucide-react';
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { toast } from 'sonner';

type TelegramLoginProps = {
  botId: number;
  buttonSize: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  canSendMessages?: boolean;
  showUserPhoto?: boolean;
} & React.ComponentProps<'button'>;

const TelegramLogin: FC<TelegramLoginProps> = ({
  botId,
  buttonSize = 'large',
  cornerRadius,
  canSendMessages = false,
  showUserPhoto = true,
  ...props
}) => {
  const { mutateAsync: authenticate, isPending } = useAuthenticateTelegram();

  const handleTelegramAuth = async () => {
    // Construct the auth URL with proper parameters
    const params = new URLSearchParams({
      bot_id: botId.toString(),
      origin: window.location.origin,
      embed: '1',
      request_access: canSendMessages ? 'write' : 'read',
      return_to: window.location.origin,
    });

    const telegramUrl = `https://oauth.telegram.org/auth?${params.toString()}`;

    console.log('Opening Telegram auth URL:', telegramUrl);
    console.log('Current origin:', window.location.origin);

    // Open popup window
    const popup = window.open(
      telegramUrl,
      'telegram-login',
      'width=550,height=470,resizable=0,scrollbars=0,menubar=0,toolbar=0,status=0',
    );

    if (!popup) {
      console.error('Failed to open popup - popup blocker might be active');
      return;
    }

    const messageHandler = async (event: MessageEvent) => {
      // Accept messages from telegram.org domains and same origin
      if (
        !event.origin.includes('telegram.org') &&
        event.origin !== window.location.origin
      ) {
        return;
      }

      console.log('Received message from:', event.origin, event.data);

      // Handle various message formats from Telegram OAuth
      if (event.data) {
        let userData = null;

        // Try different data structures
        if (event.data.user) {
          userData = event.data.user;
        } else if (event.data.id && event.data.first_name && event.data.hash) {
          userData = event.data;
        } else if (event.data.type === 'telegram-auth' && event.data.user) {
          userData = event.data.user;
        }

        if (userData && userData.id && userData.hash) {
          window.removeEventListener('message', messageHandler);
          popup?.close();

          try {
            await authenticate({
              input: {
                id: userData.id.toString(),
                first_name: userData.first_name,
                last_name: userData.last_name || '',
                username: userData.username || '',
                photo_url: userData.photo_url || '',
                auth_date: userData.auth_date.toString(),
                hash: userData.hash,
              },
            });
          } catch (error) {
            console.error('Failed to login via telegram:', error);
            if (isGraphQLRequestError(error)) {
              toast.error(error.response.errors[0].message);
            } else if (error instanceof Error) {
              toast.error(error.message);
            }
          }
        }
      }
    };

    window.addEventListener('message', messageHandler);

    // Handle popup closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        console.log('Popup was closed manually');
      }
    }, 1000);

    // Cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      window.removeEventListener('message', messageHandler);
      if (!popup?.closed) {
        popup?.close();
      }
    }, 300000);
  };

  return (
    <Button
      type='button'
      onClick={handleTelegramAuth}
      className='flex mx-auto max-w-fit justify-center text-center rounded-full'
      disabled={isPending}
      {...props}
    >
      {isPending && <Loader2 className='animate-spin' />}
      {!isPending && <>Войти через Telegram</>}
    </Button>
  );
};

export default TelegramLogin;
