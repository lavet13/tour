import SparklesText from '@/components/ui/sparkles-text';
import { FC } from 'react';

const Home: FC = () => {
  return (
    <div className='container xl:max-w-screen-xl grow shrink-0 flex flex-col justify-center items-center'>
      <SparklesText
        className='text-4xl md:text-5xl lg:text-6xl xl:text-7xl'
        text='Донбасс-Тур'
      />
    </div>
  );
};

export default Home;
