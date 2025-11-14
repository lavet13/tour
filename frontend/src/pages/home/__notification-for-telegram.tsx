import { Icons } from '@/components/icons';
import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { type DefaultValues } from '@/pages/home';

const NotificationForTelegram: FC = () => {
  const form = useFormContext<DefaultValues>();

  return (
    <div className='flex-1'>
      <div className='px-4 p-5 max-w-[500px] md:py-6 md:p-12 flex flex-col mx-auto items-center'>
        <div className='rounded-full bg-sky-500 p-3 mb-4'>
          <Icons.telegram className='h-8 w-8 fill-white' />
        </div>
        <h2 className='text-center text-2xl font-bold text-foreground mb-2'>
          Получайте уведомления в Telegram через нашего бота
        </h2>
        <p className='text-muted-foreground text-center mb-6 leading-relaxed'>
          Подключите Telegram, чтобы мгновенно узнавать о появлении свободных
          мест и получать подтверждения бронирования. Это займет всего минуту!
        </p>
      </div>
    </div>
  );
};

export default NotificationForTelegram;
