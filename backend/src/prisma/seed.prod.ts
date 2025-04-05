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
    'Ялта (Азов)',
    'Белосарайская коса',
    'Мелекино',
    'Мариуполь',
  ];

  const coastalCityIds = await createCities(coastalCities);

  console.log('Маршруты и данные успешно добавлены');

  // Create users with different role combinations
  await prisma.user.create({
    data: {
      name: 'Anna',
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

async function createCities(names: string[]) {
  const cityIds: { [name: string]: string } = {};

  for (const name of names) {
    const city = await prisma.city.create({ data: { name } });
    cityIds[name] = city.id;
  }

  return cityIds;
}

seed().catch(error => console.error('Error seeding database: ', error));
