import DataLoader from 'dataloader';
import prismaClient from '@/prisma';
import { Booking } from '@prisma/client';

export const createBookingsLoader = (prisma: typeof prismaClient) => {
  // return new DataLoader<bigint, Booking[]>(async (routeIds: readonly bigint[]) => {
  //   const bookings = await prisma.booking.findMany({
  //     where: {
  //       routeId: { in: routeIds as bigint[] },
  //     },
  //   });
  //
  //   const bookingsByRouteId = routeIds.map((routeId) =>
  //     bookings.filter((booking) => booking.routeId === routeId)
  //   );
  //
  //   return bookingsByRouteId;
  // });
  return new DataLoader<bigint, Booking[]>(async (routeIds: readonly bigint[]) => {
    // Fetch all bookings for the provided route IDs
    const bookings = await prisma.booking.findMany({
      where: {
        routeId: { in: routeIds as bigint[] },
      },
    });

    // Group bookings by routeId using a Map
    const bookingsMap = new Map<bigint, Booking[]>();
    for (const booking of bookings) {
      if (!bookingsMap.has(booking.routeId)) {
        bookingsMap.set(booking.routeId, []);
      }
      bookingsMap.get(booking.routeId)?.push(booking);
    }

    // Map routeIds to their corresponding bookings (or an empty array if no bookings exist)
    return routeIds.map((routeId) => bookingsMap.get(routeId) || []);
  });
};
