import { useParams } from "react-router-dom";

interface SchedulesProps {}

function Schedules({}: SchedulesProps) {
  const { route_id } = useParams<{ route_id: string }>();

  return (
    <div>
      <h1>Schedules for Route {route_id}</h1>
      {/* Your schedule content here */}
    </div>
  );
}

export default Schedules;
