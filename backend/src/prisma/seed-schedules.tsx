import prisma from '@/prisma';
import { RouteDirection, Prisma } from '@prisma/client';

let countDown = 0;

type Cities = Record<string, Awaited<Prisma.CityGetPayload<{}>>>;

export default async function seedSchedulesOnly() {
  if (countDown > 0) {
    return;
  }
  countDown++;

  // Only delete existing schedules
  await prisma.schedule.deleteMany({});

  // Fetch existing cities and routes from database
  const existingCities = await prisma.city.findMany();
  const existingRoutes = await prisma.route.findMany({
    include: {
      departureCity: true,
      arrivalCity: true,
    },
  });

  // Create cities lookup object
  const cities: Cities = {};
  existingCities.forEach(city => {
    cities[city.name] = city;
  });

  // Group routes by departure city and arrival city
  const routesByDeparture: Record<
    string,
    Record<
      string,
      Prisma.RouteGetPayload<{
        include: { departureCity: true; arrivalCity: true };
      }>
    >
  > = {};

  existingRoutes.forEach(route => {
    const departureCityName = route.departureCity.name;
    const arrivalCityName = route.arrivalCity.name;

    if (!routesByDeparture[departureCityName]) {
      routesByDeparture[departureCityName] = {};
    }

    routesByDeparture[departureCityName][arrivalCityName] = route;
  });

  // Create schedules for ALL existing routes
  await createAllRouteSchedules(cities, routesByDeparture);

  console.log('Schedule seed completed successfully');
}

// Generate time for a city stop based on city and stop
function generateTimeForCityStop(
  city: string,
  stopName: string,
  isForward: boolean,
): string | null {
  // Base city times
  const cityTimesBase: Record<string, { forward: string; backward: string }> = {
    Горловка: { forward: '07:00', backward: '18:00' },
    Енакиево: { forward: '07:30', backward: '17:30' },
    Ждановка: { forward: '07:45', backward: '17:15' },
    Кировское: { forward: '07:30', backward: '17:30' },
    Харцызск: { forward: '08:00', backward: '17:00' },
    'Кр. Луч': { forward: '06:45', backward: '18:15' },
    Снежное: { forward: '07:15', backward: '17:45' },
    Торез: { forward: '07:30', backward: '17:30' },
    Шахтерск: { forward: '07:45', backward: '17:15' },
    Зугрес: { forward: '08:00', backward: '17:00' },
  };

  // Specialized times for cities with multiple stops
  const specialTimes: Record<
    string,
    Record<string, { forward: string; backward: string }>
  > = {
    Макеевка: {
      'ост. Зеленый': { forward: '08:15', backward: '16:45' },
      '"Сарепта"': { forward: '08:30', backward: '16:30' },
    },
    Донецк: {
      Мотель: { forward: '08:45', backward: '16:15' },
      'Парковка ТЦ "Юзовский пассаж" пл-дь Коммунаров 1': {
        forward: '09:00',
        backward: '16:00',
      },
    },
  };

  // Determine time for specific stop
  let timeInfo;
  if (specialTimes[city] && specialTimes[city][stopName]) {
    timeInfo = specialTimes[city][stopName];
  } else {
    timeInfo = cityTimesBase[city];
  }

  if (!timeInfo) {
    return null;
  }

  // Return appropriate time based on direction
  return isForward ? timeInfo.forward : timeInfo.backward;
}

// Get info for all stops in a city
function getCityStopsInfo(city: string): { city: string; stopName: string }[] {
  const cityStops: Record<string, string[]> = {
    Горловка: ['"Мебельный город"'],
    Енакиево: ['магазин "Фокс" напротив церкви'],
    Ждановка: ['Енакиевский поворот'],
    Кировское: ['ул.Асфальтная'],
    Харцызск: ['напротив Лицея (р-он Танка)'],
    'Кр. Луч': ['ост. ул Чкалова'],
    Снежное: ['ул.Ленина/ул.Гагарина'],
    Торез: ['пр-т Гагарина'],
    Шахтерск: ['ул. Ленина'],
    Зугрес: ['ул. Карла Маркса'],
    Макеевка: ['ост. Зеленый', '"Сарепта"'],
    Донецк: ['Мотель', 'Парковка ТЦ "Юзовский пассаж" пл-дь Коммунаров 1'],
  };

  return (cityStops[city] || ['']).map(stopName => ({
    city: city,
    stopName: stopName,
  }));
}

// Main function to create schedules for ALL routes
async function createAllRouteSchedules(
  cities: Cities,
  routesByDeparture: Record<
    string,
    Record<
      string,
      Prisma.RouteGetPayload<{
        include: { departureCity: true; arrivalCity: true };
      }>
    >
  >,
) {
  // Information on coastal destinations
  const coastalDestinationsInfo = [
    {
      city: 'Мариуполь',
      arrivalTime: '10:30',
      departureTime: '14:30',
    },
    {
      city: 'Мелекино 1 спуск',
      arrivalTime: '11:15',
      departureTime: '13:45',
    },
    {
      city: 'Мелекино 2 спуск',
      arrivalTime: '11:30',
      departureTime: '13:30',
    },
    {
      city: 'Белосарайская коса',
      arrivalTime: '11:45',
      departureTime: '13:15',
    },
    {
      city: 'Ялта',
      arrivalTime: '12:00',
      departureTime: '13:00',
    },
    {
      city: 'Урзуф',
      arrivalTime: '12:30',
      departureTime: '12:30',
    },
  ];

  // Define the explicit fixed routes based on the CSV data
  const fixedRoutesByDeparture: Record<string, string[]> = {
    // Горловка direction
    Горловка: [
      'Горловка',
      'Енакиево',
      'Ждановка',
      'Кировское',
      'Харцызск',
      'Макеевка',
      'Донецк',
    ],
    Енакиево: [
      'Енакиево',
      'Ждановка',
      'Кировское',
      'Харцызск',
      'Макеевка',
      'Донецк',
    ],
    Ждановка: ['Ждановка', 'Кировское', 'Харцызск', 'Макеевка', 'Донецк'],
    Кировское: ['Кировское', 'Харцызск', 'Макеевка', 'Донецк'],
    Харцызск: ['Харцызск', 'Макеевка', 'Донецк'],

    // Кр. Луч direction
    'Кр. Луч': [
      'Кр. Луч',
      'Снежное',
      'Торез',
      'Шахтерск',
      'Зугрес',
      'Макеевка',
      'Донецк',
    ],
    Снежное: ['Снежное', 'Торез', 'Шахтерск', 'Зугрес', 'Макеевка', 'Донецк'],
    Торез: ['Торез', 'Шахтерск', 'Зугрес', 'Макеевка', 'Донецк'],
    Шахтерск: ['Шахтерск', 'Зугрес', 'Макеевка', 'Донецк'],
    Зугрес: ['Зугрес', 'Макеевка', 'Донецк'],

    // Common final segments
    Макеевка: ['Макеевка', 'Донецк'],
    Донецк: ['Донецк'],
  };

  // Create schedules for routes from ALL departure cities
  for (const departureCity in routesByDeparture) {
    for (const dest of coastalDestinationsInfo) {
      const route = routesByDeparture[departureCity][dest.city];
      if (!route) continue;

      // Get the correct route cities from our fixed mapping
      const routeCities = fixedRoutesByDeparture[departureCity] || [
        departureCity,
      ];

      // Create expanded forward stops with multiple stops per city
      let expandedForwardStops = [];
      for (const city of routeCities) {
        const stopsForCity = getCityStopsInfo(city);

        for (const stop of stopsForCity) {
          expandedForwardStops.push({
            ...stop,
            time: generateTimeForCityStop(city, stop.stopName, true),
          });
        }
      }

      // Create expanded backward stops with multiple stops per city
      let expandedBackwardStops = [];
      for (const city of [...routeCities].reverse()) {
        const stopsForCity = getCityStopsInfo(city);

        for (const stop of stopsForCity) {
          expandedBackwardStops.push({
            ...stop,
            time: generateTimeForCityStop(city, stop.stopName, false),
          });
        }
      }

      const forwardEndpoint = {
        city: dest.city,
        stopName: cities[dest.city]?.description || '',
        time: dest.arrivalTime,
      };

      const backwardEndpoint = {
        city: dest.city,
        stopName: cities[dest.city]?.description || '',
        time: dest.departureTime,
      };

      // Create schedule for forward direction
      await createIntermediateSchedule(
        cities,
        route.id,
        RouteDirection.FORWARD,
        expandedForwardStops,
        forwardEndpoint,
      );

      // Create schedule for backward direction
      await createIntermediateSchedule(
        cities,
        route.id,
        RouteDirection.BACKWARD,
        expandedBackwardStops,
        backwardEndpoint,
      );
    }
  }
}

// Function to create schedule with intermediate stops
async function createIntermediateSchedule(
  cities: Cities,
  routeId: string,
  direction: RouteDirection,
  intermediateStops: {
    time: string | null;
    city: string;
    stopName: string;
  }[],
  endpointStop: { city: string; stopName: string; time: string },
) {
  // If backward direction, add endpoint at the beginning
  if (direction === RouteDirection.BACKWARD) {
    await prisma.schedule.create({
      data: {
        routeId: routeId,
        direction: direction,
        cityId: cities[endpointStop.city]?.id,
        stopName: endpointStop.stopName,
        time: endpointStop.time || null,
        isActive: true,
      },
    });
  }

  // Add all intermediate stops
  for (const stop of intermediateStops) {
    if (cities[stop.city]) {
      await prisma.schedule.create({
        data: {
          routeId: routeId,
          direction: direction,
          cityId: cities[stop.city].id,
          stopName: stop.stopName,
          time: stop.time || null,
          isActive: true,
        },
      });
    }
  }

  // If forward direction, add endpoint at the end
  if (direction === RouteDirection.FORWARD) {
    await prisma.schedule.create({
      data: {
        routeId: routeId,
        direction: direction,
        cityId: cities[endpointStop.city]?.id,
        stopName: endpointStop.stopName,
        time: endpointStop.time || null,
        isActive: true,
      },
    });
  }
}

// Export the function or run it directly
seedSchedulesOnly().catch(error =>
  console.error('Error seeding schedules: ', error),
);
