import { ImageResponse } from "next/og";

/** PWA 用の PNG アイコン（/icons/192, /icons/512, /icons/180） */
export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size: raw } = await ctx.params;
  const size = [180, 192, 512].includes(Number(raw)) ? Number(raw) : 192;
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", background: "#2B2420" }}>
        <svg width={size} height={size} viewBox="0 0 64 64">
          <path d="M10 24h20v16a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8z" fill="#C8875A" />
          <path d="M30 28h3a5 5 0 0 1 0 10h-3" fill="none" stroke="#C8875A" strokeWidth={3} />
          <path d="M40 16h14l-2 14a5 5 0 0 1-5 4.4A5 5 0 0 1 42 30z" fill="#C2506F" />
          <path d="M47 34.4V46M42 48h10" stroke="#C2506F" strokeWidth={3} strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
