import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function RouteFormSkeleton() {
  return (
    <div className='w-full sm:max-w-screen-sm space-y-6 mx-auto pb-3'>
      <div className='sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] space-y-3 sm:space-y-0 sm:gap-y-4 sm:gap-x-2 px-4 sm:px-5'>
        {/* Departure City */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Arrival City */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Region */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Departure Date */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Is Active Switch */}
        <div className='col-span-2 flex items-center justify-between rounded-lg border shadow-sm p-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[150px]' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
          <Skeleton className='h-6 w-11' />
        </div>

        {/* Submit Button */}
        <Button disabled className='w-full col-span-2'>
          <Skeleton className='h-5 w-[200px]' />
        </Button>
      </div>
    </div>
  );
}
