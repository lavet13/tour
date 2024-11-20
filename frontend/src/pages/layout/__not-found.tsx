import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotFound: FC = () => {
  return (
    <div className='flex flex-col items-center min-h-screen justify-center bg-background text-foreground'>
      <h1 className='text-5xl lg:text-6xl font-bold'>404</h1>
      <p className={`text-center text-muted-foreground leading-7 [&:not(:first-child)]:mt-6`}>
        Похоже, вы забрели в неизведанные цифровые просторы.
      </p>
      <Button
        className='mt-8 bg-primary text-primary-foreground hover:bg-primary/90'
        asChild
      >
        <Link to="/">
          Вернуться на сайт
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
