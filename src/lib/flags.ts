export const flags = {
  google: process.env.NEXT_PUBLIC_ENABLE_GOOGLE === "1",
  apple: process.env.NEXT_PUBLIC_ENABLE_APPLE === "1",
  devLogin: process.env.NEXT_PUBLIC_DEV_LOGIN === "1",
};

export const LAST_TAB_COOKIE = "mg_last_tab";
