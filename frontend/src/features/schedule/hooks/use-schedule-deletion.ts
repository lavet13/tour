import { useRef, useState } from 'react';
import { useDeleteSchedule } from '../api/mutations';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/react-query';

export const useScheduleDeletion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteSchedule, isPending: deleteIsPending } =
    useDeleteSchedule();
  const idToDelete = useRef<string | null>(null);
  const { toast } = useToast();

  const handleDeleteSchedule = (id: string) => () => {
    setIsOpen(true);
    idToDelete.current = id;
  };

  const confirmDelete = async () => {
    deleteSchedule(
      { id: idToDelete.current! },
      {
        async onSuccess() {
          setIsOpen(false);
          idToDelete.current = null;
          setTimeout(() => (document.body.style.pointerEvents = ''), 500);
          await client.invalidateQueries({ queryKey: ['GetSchedulesByRoute'] });
          toast({
            title: 'Операция была проведена успешно!',
            description: 'Запись из расписания была удалена безвозвратно! >:)',
          });
        },
      },
    );
  };

  const handleOnOpenChange = (isOpen: boolean) => {
    console.log({ isOpen });
    if (!isOpen) {
      idToDelete.current = null;
    }
    setIsOpen(isOpen);
    setTimeout(() => (document.body.style.pointerEvents = ''), 500);
  };

  return {
    isOpen,
    handleOnOpenChange,
    handleDeleteSchedule,
    confirmDelete,
    deleteIsPending,
  };
};
