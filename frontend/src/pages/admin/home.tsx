import { FC } from 'react';

const AdminPage: FC = () => {
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='flex justify-center items-center flex-1 rounded-xl bg-muted/50 md:min-h-min'>
        <h1 className="text-center scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Добро пожаловать!</h1>
      </div>
    </div>
  );
};

export default AdminPage;
