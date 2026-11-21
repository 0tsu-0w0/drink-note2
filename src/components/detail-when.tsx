"use client";

import { useEffect, useState } from "react";
import { fmtDay, fmtTime } from "@/lib/stats";

/** 端末のタイムゾーンで日時を出す */
export function DetailWhen({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => setText(`${fmtDay(iso)} ${fmtTime(iso)}`), [iso]);
  return <span className="num">{text}</span>;
}
