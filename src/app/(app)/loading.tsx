/* 画面の読み込み中に出す骨組み。押した瞬間に反応が見えるようにする */
export default function Loading() {
  return (
    <div className="page" aria-busy="true" aria-label="読み込み中">
      <div className="skeleton" style={{ width: 120, height: 32, marginBottom: 16 }} />
      <div className="summary">
        <div className="skeleton" style={{ height: 72 }} />
        <div className="skeleton" style={{ height: 72 }} />
        <div className="skeleton" style={{ height: 72 }} />
      </div>
      <div className="skeleton" style={{ width: 96, height: 20, margin: "28px 0 10px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 64 }} />
        <div className="skeleton" style={{ height: 64 }} />
        <div className="skeleton" style={{ height: 64 }} />
      </div>
    </div>
  );
}
