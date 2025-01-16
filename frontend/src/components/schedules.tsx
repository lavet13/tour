import { useMediaQuery } from '@/hooks/use-media-query';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from './ui/sidebar';

function Schedules() {
  const MOBILE_BREAKPOINT = 450;
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const navigate = useNavigate();
  const { state } = useSidebar();

  return (
    <div className='flex flex-col'>
      <div className='flex items-center gap-2'>
        {!isMobile && (
          <Button
            variant='outline'
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
            Назад
          </Button>
        )}
        {isMobile && (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button
                className="h-9 min-w-9"
                variant='outline'
                size='icon'
                onClick={() => navigate(-1)}
              >
                <ArrowLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              align={state === 'collapsed' ? 'start' : 'center'}
              side='bottom'
            >
              Вернуться назад
            </TooltipContent>
          </Tooltip>
        )}
        <Button className='w-full sm:w-auto'>
          <CalendarPlus />
          Добавить расписание
        </Button>
      </div>
    </div>
  );
}

export default Schedules;
