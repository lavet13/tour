import { CreateBookingMutation } from "@/gql/graphql";
import { atom } from "jotai";

export const createdBookingAtom = atom<CreateBookingMutation>();
