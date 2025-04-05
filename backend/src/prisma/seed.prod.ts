import prisma from '@/prisma';
import generatePasswordHash from '@/helpers/generate-password-hash';

export default async function seed() {
  const password = 'password';
  const hashedPassword = await generatePasswordHash(password);

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


  // Create users with different role combinations
  await prisma.user.create({
    data: {
      name: 'Anna',
      email: 'aistpost@rambler.ru',
      password: hashedPassword,
      roles: {
        create: [{ role: 'USER' }, { role: 'ADMIN' }, { role: 'MANAGER' }],
      },
    },
  });
  console.log('User created!');

  console.log('Production seed completed successfully');
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
