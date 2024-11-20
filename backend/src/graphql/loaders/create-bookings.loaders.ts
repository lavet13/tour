import DataLoader from 'dataloader';
import prismaClient from '@/prisma';
import { Booking } from '@prisma/client';

export const createBookingsLoader = (prisma: typeof prismaClient) => {
  return new DataLoader(async (cityIds: readonly bigint[]) => {
    // console.log('Loading bookings for cityIds:', cityIds);

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { departureCityId: { in: cityIds as bigint[] } },
          { arrivalCityId: { in: cityIds as bigint[] } },
        ],
      },
    });

    // console.log('Found bookings:', bookings.length);

    const bookingsByCityId = new Map<
      bigint,
      { departureTrips: Booking[]; arrivalTrips: Booking[] }
    >(cityIds.map(id => [id, { departureTrips: [], arrivalTrips: [] }]));

    bookings.forEach(booking => {
      if (bookingsByCityId.has(booking.departureCityId)) {
        bookingsByCityId
          .get(booking.departureCityId)!
          .departureTrips.push(booking);
      }
      if (bookingsByCityId.has(booking.arrivalCityId)) {
        bookingsByCityId.get(booking.arrivalCityId)!.arrivalTrips.push(booking);
      }
    });

    return cityIds.map(
      id =>
        bookingsByCityId.get(id) || { departureTrips: [], arrivalTrips: [] },
    );
  });
};
