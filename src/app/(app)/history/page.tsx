import { Suspense } from "react";
import { HistoryView } from "@/components/history-view";

export const metadata = { title: "履歴" };

export default function Page() {
  return (
    <Suspense>
      <HistoryView />
    </Suspense>
  );
}
