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
    // Add timestamp to force fresh auth each time
    const timestamp = Date.now();

    const params = new URLSearchParams({
      bot_id: botId.toString(),
      origin: 'https://donbass-tour.online',
      embed: '1',
      request_access: canSendMessages ? 'write' : 'read',
      return_to: window.location.origin,
      // Add cache buster to force fresh authentication
      _t: timestamp.toString(),
    });

    const telegramUrl = `https://oauth.telegram.org/auth?${params.toString()}`;

    console.log('Opening Telegram auth URL:', telegramUrl);

    // Open popup window with cache prevention
    const popup = window.open(
      telegramUrl,
      `telegram-login-${timestamp}`, // Unique window name
      'width=550,height=470,resizable=0,scrollbars=0,menubar=0,toolbar=0,status=0',
    );

    if (!popup) {
      console.error('Failed to open popup - popup blocker might be active');
      toast.error('Не удалось открыть окно авторизации. Проверьте блокировщик всплывающих окон.');
      return;
    }

    let isAuthCompleted = false;

    const messageHandler = async (event: MessageEvent) => {
      // Prevent duplicate processing
      if (isAuthCompleted) return;

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
          isAuthCompleted = true;
          window.removeEventListener('message', messageHandler);
          popup?.close();

          try {
            console.log('Authenticating with data:', userData);

            await authenticate({
              input: {
                // Convert string to BigInt for GraphQL
                id: userData.id.toString(),
                first_name: userData.first_name,
                last_name: userData.last_name || null,
                username: userData.username || null,
                photo_url: userData.photo_url || null,
                // Convert Unix timestamp to Date object
                auth_date: new Date(parseInt(userData.auth_date) * 1000),
                hash: userData.hash,
              },
            });

            toast.success('Успешный вход через Telegram!');
          } catch (error) {
            console.error('Failed to login via telegram:', error);

            if (isGraphQLRequestError(error)) {
              const errorMessage = error.response.errors[0].message;
              console.error('GraphQL Error:', errorMessage);

              if (errorMessage.includes('too old')) {
                toast.error('Данные авторизации устарели. Попробуйте войти заново.');
              } else if (errorMessage.includes('Invalid')) {
                toast.error('Ошибка проверки данных Telegram. Попробуйте еще раз.');
              } else {
                toast.error(errorMessage);
              }
            } else if (error instanceof Error) {
              toast.error(error.message);
            } else {
              toast.error('Произошла ошибка при входе через Telegram');
            }
          }
        }
      }
    };

    window.addEventListener('message', messageHandler);

    // Handle popup closed manually
    let checkClosedInterval: NodeJS.Timeout;
    const checkClosed = () => {
      if (popup?.closed) {
        if (!isAuthCompleted) {
          console.log('Popup was closed manually without completing auth');
          toast.info('Авторизация была отменена');
        }
        clearInterval(checkClosedInterval);
        window.removeEventListener('message', messageHandler);
      }
    };

    checkClosedInterval = setInterval(checkClosed, 1000);

    // Cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosedInterval);
      window.removeEventListener('message', messageHandler);
      if (!popup?.closed) {
        popup?.close();
        if (!isAuthCompleted) {
          toast.error('Время авторизации истекло');
        }
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
      {isPending && <Loader2 className='animate-spin mr-2' />}
      {!isPending && <>Войти через Telegram</>}
    </Button>
  );
};

export default TelegramLogin;
