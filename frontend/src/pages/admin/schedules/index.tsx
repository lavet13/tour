import { useSchedulesByRoute } from "@/features/schedule/use-schedules-by-route";

function SchedulesPage () {
  const { data, isPending } = useSchedulesByRoute('cm5fg0jpi000z12175w1lcgu9');

  console.log({ data, isPending });

  return null;
}

export default SchedulesPage;
