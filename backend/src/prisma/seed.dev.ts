import prisma from '@/prisma';
import generatePasswordHash from '@/helpers/generate-password-hash';
import { RouteDirection, Role } from '@prisma/client';

let countDown = 0;

type Cities = Record<string, Awaited<ReturnType<typeof prisma.city.create>>>;

export default async function seed() {
  if (countDown > 0) {
    return;
  }
  countDown++;

  // Clean existing data
  const deletedUsers = prisma.user.deleteMany({});
  const deletedRoles = prisma.userRole.deleteMany({});
  const deletedBookings = prisma.booking.deleteMany({});
  const deletedSchedules = prisma.schedule.deleteMany({});
  const deletedRoutes = prisma.route.deleteMany({});
  const deletedCities = prisma.city.deleteMany({});
  const deletedRegions = prisma.region.deleteMany({});

  await prisma.$transaction([
    deletedUsers,
    deletedRoles,
    deletedBookings,
    deletedSchedules,
    deletedRoutes,
    deletedCities,
    deletedRegions,
  ]);

  // Create regions
  const regions = {
    LDNR: await prisma.region.create({ data: { name: 'ЛДНР' } }),
    COASTAL: await prisma.region.create({
      data: { name: 'Азовское побережье' },
    }),
  };

  // Create all cities with descriptions
  const cities: Cities = {
    // LDNR cities
    Горловка: await prisma.city.create({ data: { name: 'Горловка' } }),
    Енакиево: await prisma.city.create({ data: { name: 'Енакиево' } }),
    Ждановка: await prisma.city.create({ data: { name: 'Ждановка' } }),
    Кировское: await prisma.city.create({ data: { name: 'Кировское' } }),
    Харцызск: await prisma.city.create({ data: { name: 'Харцызск' } }),
    'Кр. Луч': await prisma.city.create({ data: { name: 'Кр. Луч' } }),
    Снежное: await prisma.city.create({ data: { name: 'Снежное' } }),
    Торез: await prisma.city.create({ data: { name: 'Торез' } }),
    Шахтерск: await prisma.city.create({ data: { name: 'Шахтерск' } }),
    Зугрес: await prisma.city.create({ data: { name: 'Зугрес' } }),
    Макеевка: await prisma.city.create({ data: { name: 'Макеевка' } }),
    Донецк: await prisma.city.create({ data: { name: 'Донецк' } }),

    // Coastal cities with descriptions
    Мариуполь: await prisma.city.create({
      data: {
        name: 'Мариуполь',
        description: 'АС2, пр. Ленина',
      },
    }),
    'Мелекино 1 спуск': await prisma.city.create({
      data: {
        name: 'Мелекино 1 спуск',
        description: 'Фельдшерский пункт',
      },
    }),
    'Мелекино 2 спуск': await prisma.city.create({
      data: {
        name: 'Мелекино 2 спуск',
        description: 'продуктовый рынок в районе бывшей базы МВД',
      },
    }),
    'Белосарайская коса': await prisma.city.create({
      data: {
        name: 'Белосарайская коса',
        description: 'Почта, ул. Безуха, 139А',
      },
    }),
    Ялта: await prisma.city.create({
      data: {
        name: 'Ялта',
        description: 'по согласованию',
      },
    }),
    Урзуф: await prisma.city.create({
      data: {
        name: 'Урзуф',
        description: 'ул. 2-я Набережная - продуктовый рынок',
      },
    }),
  };

  // List of all LDNR cities
  const ldnrCities = [
    'Горловка',
    'Енакиево',
    'Ждановка',
    'Кировское',
    'Харцызск',
    'Кр. Луч',
    'Снежное',
    'Торез',
    'Шахтерск',
    'Зугрес',
    'Макеевка',
    'Донецк',
  ];

  // List of all coastal destinations
  const coastalDestinations = [
    'Мелекино 1 спуск',
    'Мелекино 2 спуск',
    'Белосарайская коса',
    'Ялта',
    'Урзуф',
  ];

  // Create routes from ALL LDNR cities to ALL coastal destinations
  const allRoutes: Record<string, Record<string, any>> = {};

  for (const departureCity of ldnrCities) {
    allRoutes[departureCity] = {};

    // Routes to coastal destinations
    for (const destination of coastalDestinations) {
      const price = getPriceForRoute(departureCity, 'COASTAL');

      allRoutes[departureCity][destination] = await prisma.route.create({
        data: {
          departureCityId: cities[departureCity].id,
          arrivalCityId: cities[destination].id,
          regionId: regions.COASTAL.id,
          isActive: true,
          price: price,
        },
      });
    }

    // Route to Mariupol
    const mariupolPrice = getPriceForRoute(departureCity, 'MARIUPOL');

    allRoutes[departureCity]['Мариуполь'] = await prisma.route.create({
      data: {
        departureCityId: cities[departureCity].id,
        arrivalCityId: cities['Мариуполь'].id,
        regionId: regions.LDNR.id,
        isActive: true,
        price: mariupolPrice,
      },
    });
  }

  // Create schedules for ALL routes
  await createAllRouteSchedules(cities, allRoutes, [
    ...coastalDestinations,
    'Мариуполь',
  ]);

  // Create test users
  const password = 'password';
  const hashedPassword = await generatePasswordHash(password);
  await createUsers(hashedPassword);

  console.log('Seed completed successfully');
}

// Create test users
async function createUsers(hashedPassword: string) {
  const users = [
    { name: 'Regular User', email: 'user@mail.com', roles: [Role.USER] },
    {
      name: 'Admin User',
      email: 'admin@mail.com',
      roles: [Role.USER, Role.ADMIN],
    },
    {
      name: 'Manager User',
      email: 'manager@mail.com',
      roles: [Role.USER, Role.MANAGER],
    },
    {
      name: 'Super User',
      email: 'super@mail.com',
      roles: [Role.USER, Role.ADMIN, Role.MANAGER],
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        roles: {
          create: user.roles.map(role => ({
            role,
          })),
        },
      },
    });
  }
}

// Define route price based on departure city and destination type
function getPriceForRoute(
  departureCity: string,
  destinationType: 'COASTAL' | 'MARIUPOL',
): number {
  // Prices mapping according to CSV data
  const priceMap: Record<string, { coastal: number; mariupol: number }> = {
    Горловка: { coastal: 1500, mariupol: 1500 },
    Енакиево: { coastal: 1500, mariupol: 1500 },
    Ждановка: { coastal: 1500, mariupol: 1500 },
    Кировское: { coastal: 1500, mariupol: 1500 },
    Харцызск: { coastal: 1200, mariupol: 1200 },
    'Кр. Луч': { coastal: 2500, mariupol: 2500 },
    Снежное: { coastal: 1500, mariupol: 1500 },
    Торез: { coastal: 1500, mariupol: 1500 },
    Шахтерск: { coastal: 1500, mariupol: 1500 },
    Зугрес: { coastal: 1200, mariupol: 1200 },
    Макеевка: { coastal: 1000, mariupol: 800 },
    Донецк: { coastal: 1000, mariupol: 700 },
  };

  // Return the price based on departure city and destination type
  if (destinationType === 'MARIUPOL') {
    return priceMap[departureCity]?.mariupol || 1500;
  } else {
    return priceMap[departureCity]?.coastal || 1500;
  }
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
    Снежное: ['ул.Ленина/ ул.Гагарина'],
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
  allRoutes: Record<string, Record<string, any>>,
  allDestinations: string[],
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
    'Горловка': ['Горловка', 'Енакиево', 'Ждановка', 'Кировское', 'Харцызск', 'Макеевка', 'Донецк'],
    'Енакиево': ['Енакиево', 'Ждановка', 'Харцызск', 'Макеевка', 'Донецк'],
    'Ждановка': ['Ждановка', 'Харцызск', 'Макеевка', 'Донецк'],
    'Кировское': ['Кировское', 'Харцызск', 'Макеевка', 'Донецк'],
    'Харцызск': ['Харцызск', 'Макеевка', 'Донецк'],

    // Кр. Луч direction
    'Кр. Луч': ['Кр. Луч', 'Снежное', 'Торез', 'Шахтерск', 'Зугрес', 'Макеевка', 'Донецк'],
    'Снежное': ['Снежное', 'Торез', 'Шахтерск', 'Зугрес', 'Макеевка', 'Донецк'],
    'Торез': ['Торез', 'Шахтерск', 'Зугрес', 'Макеевка', 'Донецк'],
    'Шахтерск': ['Шахтерск', 'Зугрес', 'Макеевка', 'Донецк'],
    'Зугрес': ['Зугрес', 'Макеевка', 'Донецк'],

    // Common final segments
    'Макеевка': ['Макеевка', 'Донецк'],
    'Донецк': ['Донецк'],
  };

  // Create schedules for routes from ALL departure cities
  for (const departureCity in allRoutes) {
    for (const dest of coastalDestinationsInfo) {
      const route = allRoutes[departureCity][dest.city];
      if (!route) continue;

      // Get the correct route cities from our fixed mapping
      const routeCities = fixedRoutesByDeparture[departureCity] || [departureCity];
      const isAlternateRoute = ['Кр. Луч', 'Снежное', 'Торез', 'Шахтерск', 'Зугрес'].includes(departureCity);

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

      // Create schedule for forward direction
      await createIntermediateSchedule(
        cities,
        route.id,
        RouteDirection.FORWARD,
        expandedForwardStops,
        {
          city: dest.city,
          stopName: cities[dest.city].description || '',
          time: dest.arrivalTime,
        },
      );

      // Create schedule for backward direction
      await createIntermediateSchedule(
        cities,
        route.id,
        RouteDirection.BACKWARD,
        expandedBackwardStops,
        {
          city: dest.city,
          stopName: cities[dest.city].description || '',
          time: dest.departureTime,
        },
      );
    }
  }
}

// Function to create schedule with intermediate stops
async function createIntermediateSchedule(
  cities: Cities,
  routeId: string,
  direction: RouteDirection,
  intermediateStops: any[],
  endpointStop: any,
) {
  // If backward direction, add endpoint at the beginning
  if (direction === RouteDirection.BACKWARD) {
    await prisma.schedule.create({
      data: {
        routeId: routeId,
        direction: direction,
        cityId: cities[endpointStop.city].id,
        stopName: endpointStop.stopName,
        time: endpointStop.time || null,
        isActive: true,
      },
    });
  }

  // Add all intermediate stops
  for (const stop of intermediateStops) {
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

  // If forward direction, add endpoint at the end
  if (direction === RouteDirection.FORWARD) {
    await prisma.schedule.create({
      data: {
        routeId: routeId,
        direction: direction,
        cityId: cities[endpointStop.city].id,
        stopName: endpointStop.stopName,
        time: endpointStop.time || null,
        isActive: true,
      },
    });
  }
}

seed().catch(error => console.error('Error seeding database: ', error));
