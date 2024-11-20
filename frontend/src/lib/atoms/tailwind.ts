import { atom } from 'jotai';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from 'tailwind-config';

const fullConfig = resolveConfig(tailwindConfig);

const fullConfigAtom = atom(fullConfig);

const screensAtom = atom(get => {
  const fullConfig = get(fullConfigAtom);
  return fullConfig.theme?.screens as Record<string, string>;
});

export const breakpointsAtom = atom(get => {
  const screens = get(screensAtom);
  return Object.entries(screens).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: parseInt(value.replace('px', ''), 10),
    }),
    {} as Record<string, number>,
  );
});
