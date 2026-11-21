"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GENRES } from "@/lib/domain";
import type { Drink } from "@/lib/types";
import { DRINKS_CHANGED, useToast } from "@/components/toast";

export function DetailActions({ drink }: { drink: Drink }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const base = GENRES[drink.genre].path;

  async function remove() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("drinks").delete().eq("id", drink.id);
    if (error) {
      setBusy(false);
      toast.show({ title: "削除できませんでした", sub: "通信状態を確認してください" });
      return;
    }
    /* 確認ダイアログの代わりに「元に戻す」を出す（F-44） */
    toast.show({
      title: `「${drink.name}」を削除しました`,
      ms: 6000,
      action: {
        label: "元に戻す",
        run: async () => {
          const { error } = await supabase.from("drinks").insert(drink);
          if (error) {
            toast.show({ title: "元に戻せませんでした" });
            return;
          }
          window.dispatchEvent(new Event(DRINKS_CHANGED));
          router.refresh();
        },
      },
    });
    router.replace("/history", { transitionTypes: ["nav-back"] });
    router.refresh();
  }

  return (
    <div className="actions">
      <Link href={`${base}?again=${drink.id}`} className="btn btn-primary" transitionTypes={["nav-back"]}>
        もう一度記録
      </Link>
      <Link href={`${base}?edit=${drink.id}`} className="btn" transitionTypes={["nav-back"]}>
        直す
      </Link>
      <button type="button" className="btn btn-danger" disabled={busy} onClick={() => void remove()}>
        削除
      </button>
    </div>
  );
}
