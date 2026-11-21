export const flags = {
  google: process.env.NEXT_PUBLIC_ENABLE_GOOGLE === "1",
  apple: process.env.NEXT_PUBLIC_ENABLE_APPLE === "1",
  /*
   * 開発用ログイン（匿名ログイン）は本番ビルドでは出さない。
   * 環境変数を消し忘れても、誰でもアカウントを作れる入口が公開されないようにする。
   */
  devLogin: process.env.NEXT_PUBLIC_DEV_LOGIN === "1" && process.env.NODE_ENV !== "production",
};

export const LAST_TAB_COOKIE = "mg_last_tab";
