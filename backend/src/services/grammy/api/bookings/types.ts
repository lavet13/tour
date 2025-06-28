import { Prisma } from "@prisma/client";

export type NotifyNewBookingType = (
  booking: Prisma.BookingGetPayload<{
    include: {
      route: {
        include: {
          arrivalCity: {
            select: {
              name: true;
            };
          };
          departureCity: {
            select: {
              name: true;
            };
          };
        };
      };
    };
  }>,
) => Promise<void>;
