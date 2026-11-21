import { Suspense } from "react";
import { HistoryView } from "@/components/history-view";
import { PageTransition } from "@/components/page-transition";

export const metadata = { title: "履歴" };

export default function Page() {
  return (
    <PageTransition>
      <Suspense>
        <HistoryView />
      </Suspense>
    </PageTransition>
  );
}
