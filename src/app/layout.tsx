import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Mug & Glass", template: "%s | Mug & Glass" },
  description: "コーヒーとお酒の記録",
  appleWebApp: { capable: true, title: "Mug & Glass", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icons/180" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#171412" },
  ],
};

/* 保存したテーマを描画前に当てる（ちらつき防止） */
const themeBoot = `(function(){try{var t=localStorage.getItem("mg_theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
