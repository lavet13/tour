import { useState, useEffect, KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { isGraphQLRequestError } from '@/react-query/types/is-graphql-request-error';
import { useUpdateSchedule } from '@/features/schedule/api/mutations';
import {
  ScheduleColumns,
  columnTranslations,
} from '@/pages/admin/routes/[route_id]/schedules/__columns';

type UseEditableFieldProps<T> = {
  originalId: string;
  columnId: string;
  initialValue: T;
  formatDisplay?: (value: T) => string;
  formatSuccess?: (oldValue: T, newValue: T) => string;
};

export function useEditableField<T>({
  originalId,
  columnId,
  initialValue,
  formatDisplay,
  formatSuccess,
}: UseEditableFieldProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<T>(initialValue);
  // Store the true original value that never changes during component lifecycle
  const [originalValue] = useState<T>(initialValue);

  // Keep value in sync with prop changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const { mutate: updateSchedule, isPending } = useUpdateSchedule();

  const handleUpdate = (newValue: T) => {
    // Don't update if value hasn't changed
    if (newValue === initialValue) {
      setIsEditing(false);
      return;
    }

    const toastId = toast.loading(
      `Обновление поля \`${columnTranslations[columnId as ScheduleColumns]}\`...`,
    );

    // Store mutation data in a closure to ensure it's preserved for this specific update
    const updateData = {
      fieldId: columnId,
      originalValue: originalValue,
      newValue: newValue,
      rowId: originalId,
    };

    updateSchedule(
      { input: { id: originalId, [columnId]: newValue } },
      {
        onSuccess: async () => {
          toast.dismiss(toastId);

          // Format the success message
          let successMessage = `\`${columnTranslations[columnId as ScheduleColumns]}\` изменёно успешно!`;

          // Use custom format if provided
          if (formatSuccess) {
            successMessage = formatSuccess(initialValue, newValue);
          } else if (formatDisplay) {
            // Default formatting using display formatter
            successMessage = `\`${columnTranslations[columnId as ScheduleColumns]}\` изменёно ${formatDisplay(initialValue)} → ${formatDisplay(newValue)}`;
          } else {
            // Basic fallback
            successMessage = `\`${columnTranslations[columnId as ScheduleColumns]}\` изменёно ${String(initialValue)} → ${String(newValue)}`;
          }

          toast.success(successMessage, {
            duration: 10000,
            action: {
              label: 'Отменить',
              onClick() {
                // Use the closure-captured values for this specific update
                updateSchedule(
                  {
                    input: {
                      id: updateData.rowId,
                      [updateData.fieldId]: updateData.originalValue,
                    },
                  },
                  {
                    async onSuccess() {
                      toast.success(
                        `Отмена изменения поля \`${columnTranslations[updateData.fieldId as ScheduleColumns]}\` выполненo успешно!`,
                      );
                    },
                    onError() {
                      toast.error(
                        `Не удалось отменить изменения поля \`${columnTranslations[updateData.fieldId as ScheduleColumns]}\`!`,
                      );
                    },
                  },
                );
              },
            },
          });
        },
        onError(error) {
          let errorMessage = 'Произошла ошибка!';
          if (isGraphQLRequestError(error)) {
            errorMessage = error.response.errors[0].message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          toast.error(errorMessage, { id: toastId });
        },
        onSettled() {
          setIsEditing(false);
        },
      },
    );
  };

  // Common keyboard handlers for input fields
  const onKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    validate?: () => boolean,
  ) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      if (validate && !validate()) {
        return;
      }
      handleUpdate(value);
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  const onBlur = (validate?: () => boolean) => {
    if (validate && !validate()) {
      return;
    }
    handleUpdate(value);
  };

  return {
    value,
    setValue,
    isEditing,
    setIsEditing,
    isPending,
    handleUpdate,
    onKeyDown,
    onBlur,
    originalValue,
  };
}
