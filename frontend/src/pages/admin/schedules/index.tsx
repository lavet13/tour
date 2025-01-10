import { useSchedulesByRoute } from '@/features/schedule/use-schedules-by-route';
import { Link, useSearchParams } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { SonnerSpinner } from '@/components/sonner-spinner';

function SchedulesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeId = searchParams.get('id')!;
  const { data, fetchStatus, status } = useSchedulesByRoute(routeId, {
    enabled: !!routeId,
  });

  const backgroundUpdate = fetchStatus === 'fetching' && status === 'success';
  const initialLoading = fetchStatus === 'fetching' && status === 'pending';

  console.log({
    routeId,
    data,
    fetchStatus,
    status,
    backgroundUpdate,
    initialLoading,
  });

  return data ? null : initialLoading ? (
    <div className='flex-1 flex items-center justify-center'>
      <SonnerSpinner className='bg-foreground' />
    </div>
  ) : (
    <div className='flex justify-center items-center'>
      <Link
        className={buttonVariants({ className: 'w-fit', variant: 'link' })}
        to='/admin/routes'
      >
        Выберите маршрут
      </Link>
    </div>
  );
}

export default SchedulesPage;
