import prisma from '@/prisma';
import generatePasswordHash from '@/helpers/generate-password-hash';
import { RouteDirection, Role } from '@prisma/client';

let countDown = 0;

export default async function seed() {
  if (countDown > 0) {
    return;
  }

  countDown++;

  const password = 'password';
  const hashedPassword = await generatePasswordHash(password);

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

  const regions = {
    LDNR: await prisma.region.create({ data: { name: 'ЛДНР' } }),
    COASTAL: await prisma.region.create({
      data: { name: 'Азовское побережье' },
    }),
  };

  const ldnrCities = [
    'Горловка',
    'Енакиево',
    'Юнокоммунарск',
    'Ждановка',
    'Кировское',
    'Кр. Луч',
    'Снежное',
    'Шахтерск',
    'Зугрес',
    'Торез',
    'Харцызск',
    'Макеевка',
    'Донецк',
  ];

  // Добавление городов
  const cityIds = await createCities(ldnrCities);

  // Добавление Мариуполя и прибрежных городов
  const mariupol = await prisma.city.create({
    data: { name: 'Мариуполь' },
  });

  const coastalCities = [
    'Урзуф',
    'Юрьевка',
    'Ялта (Азов)',
    'Белосарайская коса',
    'Мелекино',
    'Мангуш',
  ];

  const coastalCityIds = await createCities(coastalCities);

  // Создание маршрутов в Мариуполь
  for (const city of ldnrCities) {
    const route = await prisma.route.create({
      data: {
        departureCityId: cityIds[city],
        arrivalCityId: mariupol.id,
        regionId: regions.LDNR.id,
        price: getRandomInteger(400, 1000),
      },
    });

    // Создание прямого расписания (FORWARD - из города в Мариуполь)
    await prisma.schedule.create({
      data: {
        routeId: route.id,
        direction: RouteDirection.FORWARD,
        departureTime: getRandomTime(),
        arrivalTime: getRandomTime(true), // Прибытие после отправления
        stopName: `Автовокзал ${city}`,
        isActive: true,
      },
    });

    // Создание обратного расписания (BACKWARD - из Мариуполя в город)
    await prisma.schedule.create({
      data: {
        routeId: route.id,
        direction: RouteDirection.BACKWARD,
        departureTime: getRandomTime(),
        arrivalTime: getRandomTime(true), // Прибытие после отправления
        stopName: 'Автовокзал Мариуполь',
        isActive: true,
      },
    });

    // Создание бронирования для маршрута
    await prisma.booking.create({
      data: {
        firstName: 'Иван',
        lastName: 'Иванов',
        phoneNumber: '+380123456789',
        routeId: route.id,
        travelDate: new Date('2023-01-01'), // Дата поездки
        seatsCount: 2, // Количество забронированных мест
        status: 'CONFIRMED', // Статус бронирования
      },
    });
  }

  // Создание маршрутов из Мариуполя в прибрежные города с 1 мая 2025
  for (const city of coastalCities) {
    const route = await prisma.route.create({
      data: {
        departureCityId: mariupol.id,
        arrivalCityId: coastalCityIds[city],
        regionId: regions.COASTAL.id,
        departureDate: new Date('2025-05-01'),
        price: getRandomInteger(400, 1000),
      },
    });

    // Создание прямого расписания (FORWARD - из Мариуполя на побережье)
    await prisma.schedule.create({
      data: {
        routeId: route.id,
        direction: RouteDirection.FORWARD,
        departureTime: getRandomTime(),
        arrivalTime: getRandomTime(true), // Прибытие после отправления
        stopName: 'Автовокзал Мариуполь',
        isActive: true,
      },
    });

    // Создание обратного расписания (BACKWARD - с побережья в Мариуполь)
    await prisma.schedule.create({
      data: {
        routeId: route.id,
        direction: RouteDirection.BACKWARD,
        departureTime: getRandomTime(),
        arrivalTime: getRandomTime(true), // Прибытие после отправления
        stopName: `Автостанция ${city}`,
        isActive: true,
      },
    });

    // Создание бронирования для маршрута
    await prisma.booking.create({
      data: {
        firstName: 'Петр',
        lastName: 'Петров',
        phoneNumber: '+380987654321',
        routeId: route.id,
        travelDate: new Date('2025-05-02'), // Дата поездки
        seatsCount: 4, // Количество забронированных мест
        status: 'PENDING', // Статус бронирования
      },
    });
  }

  console.log('Маршруты и данные успешно добавлены');

  // Create users with different role combinations
  await createUsers(hashedPassword);

  console.log('Seed completed successfully');
}

function getRandomTime(isArrival = false) {
  const now = new Date();

  // For departure time: random time 5-10 hours from now
  let randomHours = Math.floor(Math.random() * 5) + 5;

  // For arrival time: add 1-3 more hours to ensure arrival is after departure
  if (isArrival) {
    randomHours += Math.floor(Math.random() * 3) + 1;
  }

  now.setHours(now.getHours() + randomHours);

  // Format time as HH:MM
  return now.toTimeString().slice(0, 5);
}

function getRandomInteger(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

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

async function createCities(names: string[]) {
  const cityIds: { [name: string]: string } = {};

  for (const name of names) {
    const city = await prisma.city.create({ data: { name } });
    cityIds[name] = city.id;
  }

  return cityIds;
}

seed().catch(error => console.error('Error seeding database: ', error));
