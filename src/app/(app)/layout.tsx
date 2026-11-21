import { ToastProvider } from "@/components/toast";
import { TabBar } from "@/components/tab-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <main>{children}</main>
      <TabBar />
    </ToastProvider>
  );
}
