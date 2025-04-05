import prisma from '@/prisma';
import generatePasswordHash from '@/helpers/generate-password-hash';
import { RouteDirection, Role } from '@prisma/client';

let countDown = 0;

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

  // Create all cities
  const cities = {
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

    // Coastal cities
    Мариуполь: await prisma.city.create({ data: { name: 'Мариуполь' } }),
    'Мелекино 1 спуск': await prisma.city.create({
      data: { name: 'Мелекино-1', description: 'Фельдшерский пункт' },
    }),
    'Мелекино 2 спуск': await prisma.city.create({
      data: {
        name: 'Мелекино-2',
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
      data: { name: 'Ялта', description: 'по согласованию' },
    }),
    Урзуф: await prisma.city.create({
      data: {
        name: 'Урзуф',
        description: 'ул. 2-я Набережная - продуктовый рынок',
      },
    }),
  };

  // Create routes to coastal region
  const routes = [];
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

  // Create coastal destinations
  const coastalDestinations = [
    'Мариуполь',
    'Мелекино 1 спуск',
    'Мелекино 2 спуск',
    'Белосарайская коса',
    'Ялта',
    'Урзуф',
  ];

  // Create routes for each LDNR city to coastal destinations
  for (const departureCity of ldnrCities) {
    // Create route to Mariupol
    const mariupolRoute = await prisma.route.create({
      data: {
        departureCityId: cities[departureCity].id,
        arrivalCityId: cities['Мариуполь'].id,
        regionId: regions.LDNR.id,
        isActive: true,
        price: getPriceForRoute(departureCity, 'Мариуполь'),
      },
    });
    routes.push(mariupolRoute);

    // Create routes to other coastal destinations
    for (const destination of coastalDestinations) {
      if (destination !== 'Мариуполь') {
        const coastalRoute = await prisma.route.create({
          data: {
            departureCityId: cities[departureCity].id,
            arrivalCityId: cities[destination].id,
            regionId: regions.COASTAL.id,
            isActive: true,
            price: getPriceForRoute(departureCity, 'COASTAL'),
          },
        });
        routes.push(coastalRoute);
      }
    }
  }

  // Create schedules based on the provided tables
  await createSchedules(cities, routes);

  // Create test user with multiple roles
  const password = 'password';
  const hashedPassword = await generatePasswordHash(password);

  await prisma.user.create({
    data: {
      name: 'anna gorban',
      email: 'aistpost@rambler.ru',
      password: hashedPassword,
      roles: {
        create: [
          { role: Role.USER },
          { role: Role.ADMIN },
          { role: Role.MANAGER },
        ],
      },
    },
  });

  console.log('Seed completed successfully');
}

// Helper function to get price for a specific route
function getPriceForRoute(
  departureCity: string,
  destinationType: string,
): number {
  // Price mapping based on the table
  const priceMap: { [key: string]: { [key: string]: number } } = {
    Горловка: { Мариуполь: 1500, COASTAL: 1500 },
    Енакиево: { Мариуполь: 1500, COASTAL: 1500 },
    Ждановка: { Мариуполь: 1500, COASTAL: 1500 },
    Кировское: { Мариуполь: 1500, COASTAL: 1500 },
    Харцызск: { Мариуполь: 1200, COASTAL: 1200 },
    'Кр. Луч': { Мариуполь: 2500, COASTAL: 2500 },
    Снежное: { Мариуполь: 1500, COASTAL: 1500 },
    Торез: { Мариуполь: 1500, COASTAL: 1500 },
    Шахтерск: { Мариуполь: 1500, COASTAL: 1500 },
    Зугрес: { Мариуполь: 1200, COASTAL: 1200 },
    Макеевка: { Мариуполь: 800, COASTAL: 1000 },
    Донецк: { Мариуполь: 700, COASTAL: 1000 },
  };

  return priceMap[departureCity]?.[destinationType] || 1500; // Default price if not specified
}

// Helper function to create schedules
async function createSchedules(cities: Record<string, any>, routes: any[]) {
  // FORWARD direction schedule data (TO the coast - first table)
  const forwardScheduleData = [
    { city: 'Горловка', stopName: '"Мебельный город"', departureTime: '07:00' },
    {
      city: 'Енакиево',
      stopName: 'магазин "Фокс" напротив церкви',
      departureTime: '07:30',
    },
    {
      city: 'Ждановка',
      stopName: 'Енакиевский поворот',
      departureTime: '07:45',
    },
    { city: 'Кировское', stopName: 'ул.Асфальтная', departureTime: '08:00' },
    {
      city: 'Харцызск',
      stopName: 'напротив Лицея (р-он Танк)',
      departureTime: '08:00',
    },
    { city: 'Кр. Луч', stopName: 'ост. ул Чкалова', departureTime: '06:45' },
    {
      city: 'Снежное',
      stopName: 'ул.Ленина/ ул.Гагарина',
      departureTime: '07:15',
    },
    { city: 'Торез', stopName: 'пр-т Гагарина', departureTime: '07:30' },
    { city: 'Шахтерск', stopName: 'ул. Ленина', departureTime: '07:45' },
    { city: 'Зугрес', stopName: 'ул. Карла Маркса', departureTime: '08:00' },
    { city: 'Макеевка', stopName: 'ост. Зеленый', departureTime: '08:15' },
    { city: 'Макеевка', stopName: '"Сарепта"', departureTime: '08:30' },
    { city: 'Донецк', stopName: 'Мотель', departureTime: '08:45' },
    {
      city: 'Донецк',
      stopName: 'Парковка ТЦ "Юзовский пассаж" ул-др Коммунаров 1',
      departureTime: '09:00',
    },
  ];

  // Coastal arrival times for forward direction
  const forwardCoastalArrivals = {
    Мариуполь: '10:30',
    'Мелекино 1 спуск': '11:30',
    'Мелекино 2 спуск': '11:15',
    'Белосарайская коса': '11:30',
    Ялта: '11:45',
    Урзуф: '12:00',
  };

  // BACKWARD direction schedule data (FROM the coast - second table)
  const backwardScheduleData = [
    { city: 'Горловка', stopName: '"Мебельный город"', arrivalTime: '18:00' },
    {
      city: 'Енакиево',
      stopName: 'магазин "Фокс" напротив церкви',
      arrivalTime: '17:30',
    },
    { city: 'Ждановка', stopName: 'Енакиевский поворот', arrivalTime: '17:15' },
    { city: 'Кировское', stopName: 'ул.Асфальтная', arrivalTime: '17:30' },
    {
      city: 'Харцызск',
      stopName: 'напротив Лицея (р-он Танк)',
      arrivalTime: '17:00',
    },
    { city: 'Кр. Луч', stopName: 'ост. ул Чкалова', arrivalTime: '18:15' },
    {
      city: 'Снежное',
      stopName: 'ул.Ленина/ ул.Гагарина',
      arrivalTime: '17:45',
    },
    { city: 'Торез', stopName: 'пр-т Гагарина', arrivalTime: '17:30' },
    { city: 'Шахтерск', stopName: 'ул. Ленина', arrivalTime: '17:15' },
    { city: 'Зугрес', stopName: 'ул. Карла Маркса', arrivalTime: '17:00' },
    { city: 'Макеевка', stopName: 'ост. Зеленый', arrivalTime: '16:45' },
    { city: 'Макеевка', stopName: '"Сарепта"', arrivalTime: '16:30' },
    { city: 'Донецк', stopName: 'Мотель', arrivalTime: '16:15' },
    {
      city: 'Донецк',
      stopName: 'Парковка ТЦ "Юзовский пассаж" ул-др Коммунаров 1',
      arrivalTime: '16:00',
    },
  ];

  // Coastal departure times for backward direction
  const backwardCoastalDepartures = {
    Мариуполь: '14:30',
    'Мелекино 1 спуск': '13:45',
    'Мелекино 2 спуск': '13:30',
    'Белосарайская коса': '13:15',
    Ялта: '13:00',
    Урзуф: '12:30',
  };

  // 1. Create FORWARD schedules (to the coast)
  for (const schedule of forwardScheduleData) {
    // Find routes that start from this city
    const cityRoutes = routes.filter(
      route => cities[schedule.city].id === route.departureCityId,
    );

    for (const route of cityRoutes) {
      // Get the arrival city name
      const arrivalCityName = Object.keys(cities).find(
        key => cities[key].id === route.arrivalCityId,
      );

      if (!arrivalCityName) continue;

      // Set arrival time based on destination
      let arrivalTime;
      if (arrivalCityName === 'Мариуполь') {
        arrivalTime = forwardCoastalArrivals['Мариуполь'];
      } else if (forwardCoastalArrivals[arrivalCityName]) {
        arrivalTime = forwardCoastalArrivals[arrivalCityName];
      } else {
        // For any other destination, use a default time
        arrivalTime = '12:00';
      }

      // Create forward schedule for this route
      await prisma.schedule.create({
        data: {
          routeId: route.id,
          direction: RouteDirection.FORWARD,
          stopName: schedule.stopName,
          departureTime: schedule.departureTime,
          arrivalTime: arrivalTime,
          isActive: true,
        },
      });
    }
  }

  // 2. Create BACKWARD schedules (from the coast)
  for (const schedule of backwardScheduleData) {
    // Find routes that end at this city
    const cityRoutes = routes.filter(
      route => cities[schedule.city].id === route.departureCityId,
    );

    for (const route of cityRoutes) {
      // Get the departure (coastal) city name
      const departureCityName = Object.keys(cities).find(
        key => cities[key].id === route.arrivalCityId,
      );

      if (!departureCityName) continue;

      // Set departure time based on coastal location
      let departureTime;
      if (departureCityName === 'Мариуполь') {
        departureTime = backwardCoastalDepartures['Мариуполь'];
      } else if (backwardCoastalDepartures[departureCityName]) {
        departureTime = backwardCoastalDepartures[departureCityName];
      } else {
        // For any other destination, use Mariupol's departure time as default
        departureTime = backwardCoastalDepartures['Мариуполь'];
      }

      // Create backward schedule for this route
      await prisma.schedule.create({
        data: {
          routeId: route.id,
          direction: RouteDirection.BACKWARD,
          stopName: schedule.stopName,
          departureTime: departureTime,
          arrivalTime: schedule.arrivalTime,
          isActive: true,
        },
      });
    }
  }
}

seed().catch(error => console.error('Error seeding database: ', error));
