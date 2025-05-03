import { CheckCircle } from 'lucide-react';
import { FC } from 'react';

const BookingResult: FC = () => {
  return (
    <div className='space-y-4 px-4 p-5 md:py-6 md:p-12'>
      <div className='p-6 flex flex-col items-center'>
        <div className='rounded-full bg-foreground p-3 mb-4'>
          <CheckCircle className='h-8 w-8 text-background' />
        </div>
        <h2 className='text-2xl font-bold text-background-700 mb-2'>
          Заявка подтверждена!
        </h2>
        <p className='text-background-600 text-center'>
          Ваша заявка успешно получена и обрабатывается.
        </p>
      </div>
    </div>
  );
};

export default BookingResult;
