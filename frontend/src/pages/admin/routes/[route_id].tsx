import { useViewportDimensions } from "@/hooks/use-viewport-dimentions";
import { cn } from "@/lib/utils";
import { useParams } from 'react-router-dom';

interface RouteByIdParams {
  route_id: string;
}

function RouteByIdPage() {
  const { route_id: routeId } = useParams<
    keyof RouteByIdParams
  >() as RouteByIdParams;

  const { contentWidth, sidebarExpanded } = useViewportDimensions();

  return (
    <div className='container px-1 sm:px-2 pt-2 mx-auto overflow-hidden flex-1 flex flex-col'>
      <div
        className={cn('relative space-y-2 flex-1', !sidebarExpanded && 'mx-0')}
        style={{
          maxWidth: `calc(${contentWidth}px)`,
        }}
      >
        <p className="text-muted-foreground text-sm">routeId: {routeId}</p>
      </div>
    </div>
  );
}

export default RouteByIdPage;
