import prisma from '@/prisma';
import generatePasswordHash from '@/helpers/generate-password-hash';
import { Prisma, Role } from '@prisma/client';

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

  // const mockedBookings: Prisma.BookingCreateManyInput[] = Array.from(
  //   { length: 20 },
  //   () => ({
  //     firstName: 'firstName',
  //     lastName: 'lastName',
  //     seatsCount: Math.random() * (10 - 1) + 1,
  //     phoneNumber: '+79494124596',
  //     travelDate: new Date(),
  //   }),
  // );
  //
  // const bookings = prisma.booking.createMany({
  //   data: mockedBookings,
  // });

  await prisma.$transaction([
    deletedUsers,
    deletedRoles,
    deletedBookings,
    // bookings,
  ]);

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
