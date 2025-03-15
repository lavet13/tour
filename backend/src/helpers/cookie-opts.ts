import { CookieListItem } from "@whatwg-node/cookie-store";

export const cookieOpts: CookieListItem = {
  httpOnly: true,
  sameSite: 'lax',
  secure: import.meta.env.DEV ? false : true,
  path: '/',
  domain: null,
  expires: null,
};
