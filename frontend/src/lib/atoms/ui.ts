import { atom } from "jotai";
import { MutableRefObject } from "react";

export const containerRefAtom = atom<MutableRefObject<HTMLDivElement | null> | null>(null)
export const activeStepAtom = atom(1);
export const navigationMenuStateAtom = atom('');
