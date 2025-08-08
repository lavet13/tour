import { CreateBookingInput } from '@/graphql/__generated__/types';

function isBookingValid(booking: CreateBookingInput): [true] | [false, string];
function isBookingValid(booking: CreateBookingInput): [boolean, string?] {
  if (booking.departureCityId.trim().length < 1) {
    return [false, 'Не выбран город отправления'];
  }

  if (booking.arrivalCityId.trim().length < 1) {
    return [false, 'Не выбран город прибытия'];
  }

  if (
    booking.lastName.trim().length < 4 ||
    booking.lastName.trim().length > 50
  ) {
    return [false, 'Фамилия не должна быть короче 4 символов и длиннее 50'];
  }

  if (
    booking.firstName.trim().length < 3 ||
    booking.firstName.trim().length > 50
  ) {
    return [false, 'Имя не должно быть короче 3 символов и длиннее 50'];
  }

  if (booking.phoneNumber.length > 12) {
    return [false, 'Неверный осн. номер телефона!'];
  }

  if (
    booking.extraPhoneNumber &&
    booking.extraPhoneNumber.length > 12
  ) {
    return [false, 'Неверный доп. номер телефона!'];
  }

  if (booking.seatsCount < 1) {
    return [false, 'Укажите кол-во мест!'];
  }

  {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(booking.travelDate);
    selectedDate.setHours(0, 0, 0, 0);

    // Validate that the date is today or in the future
    if (selectedDate < today) {
      return [false, 'Выберите сегодняшнюю или будущую дату!'];
    }
  }

  return [true];
}

export { isBookingValid };
