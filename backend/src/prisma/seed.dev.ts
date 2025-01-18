import prisma from '@/prisma';
import generatePasswordHash from '@/helpers/generate-password-hash';
import { Role } from '@prisma/client';

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
  const cityIds: { [name: string]: string } = {};
  for (const city of ldnrCities) {
    const newCity = await prisma.city.create({
      data: { name: city },
    });
    cityIds[city] = newCity.id;
  }

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

  const coastalCityIds: { [name: string]: string } = {};
  for (const city of coastalCities) {
    const newCity = await prisma.city.create({
      data: { name: city },
    });
    coastalCityIds[city] = newCity.id;
  }

  // Создание маршрутов в Мариуполь
  for (const city of ldnrCities) {
    const getRandomInteger = (min: number, max: number) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }

    const route = await prisma.route.create({
      data: {
        departureCityId: cityIds[city],
        arrivalCityId: mariupol.id,
        regionId: regions.LDNR.id,
        price: getRandomInteger(400, 1000),
      },
    });

    // Создание расписания для маршрута
    await prisma.schedule.create({
      data: {
        routeId: route.id,
        travelDate: new Date(),
        startTime: new Date(), // Время отправления
        endTime: new Date(), // Время прибытия
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
    const getRandomInteger = (min: number, max: number) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }

    const route = await prisma.route.create({
      data: {
        departureCityId: mariupol.id,
        arrivalCityId: coastalCityIds[city],
        regionId: regions.COASTAL.id,
        departureDate: new Date('2025-05-01'),
        price: getRandomInteger(400, 1000),
      },
    });

    // Создание расписания для маршрута
    await prisma.schedule.create({
      data: {
        routeId: route.id,
        travelDate: new Date(),
        startTime: new Date(), // Время отправления
        endTime: new Date(), // Время прибытия
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
  await prisma.user.create({
    data: {
      name: 'Regular User',
      email: 'user@mail.com',
      password: hashedPassword,
      roles: {
        create: { role: Role.USER },
      },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@mail.com',
      password: hashedPassword,
      roles: {
        create: [{ role: Role.USER }, { role: Role.ADMIN }],
      },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Manager User',
      email: 'manager@mail.com',
      password: hashedPassword,
      roles: {
        create: [{ role: Role.USER }, { role: Role.MANAGER }],
      },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Super User',
      email: 'super@mail.com',
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

seed().catch(error => console.error('Error seeding database: ', error));
