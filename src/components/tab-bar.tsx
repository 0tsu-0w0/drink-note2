"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlassIcon, ListIcon, MugIcon } from "@/components/icons";

const TABS = [
  { href: "/cafe", label: "カフェ", Icon: MugIcon, cls: "t-cafe" },
  { href: "/alcohol", label: "お酒", Icon: GlassIcon, cls: "t-alcohol" },
  { href: "/history", label: "履歴", Icon: ListIcon, cls: "" },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="メイン">
      <ul>
        {TABS.map(({ href, label, Icon, cls }) => (
          <li key={href}>
            <Link href={href} className={cls} aria-current={path === href ? "page" : undefined}>
              <Icon />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
