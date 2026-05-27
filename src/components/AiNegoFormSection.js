import React from "react";

function AiNegoFormSection({
  price,
  minAcceptablePrice,
  sellerStance,
  setSellerStance,
  minPriceError,
  handleMinPriceChange,
}) {
  // 💡 「値下げは考えていない」以外の時だけ価格入力を認める判定フラグ
  const isNegoEnabled =
    sellerStance === "売り切りたい" || sellerStance === "急いでいない";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        backgroundColor: "#f5f3ff",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #c084fc",
        marginTop: "5px",
        boxSizing: "border-box",
      }}
    >
      <div>
        <span
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            color: "#6b21a8",
            display: "block",
          }}
        >
          🤖 AI代理交渉（おまかせ調停）のパラメータ設定
        </span>
        <span style={{ fontSize: "11px", color: "#7c3aed" }}>
          購入者からの値引き打診をAIエージェントに自動返答させる裏ルールを定義します。
        </span>
      </div>

      {/* 🤝 出品スタンス */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
          style={{ fontSize: "12px", fontWeight: "bold", color: "#5b21b6" }}
        >
          🤝 出品スタンス（AI交渉への寛容度）{" "}
          <span style={{ color: "#ff4d4d" }}>*</span>
        </label>
        <select
          value={sellerStance}
          onChange={(e) => setSellerStance(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #c084fc",
            fontSize: "13px",
            backgroundColor: "white",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">-- 出品スタンスを選択してください --</option>
          <option value="売り切りたい">
            すぐに売り切りたい（AIが値引き・即時成立に寛容になります）
          </option>
          <option value="急いでいない">
            急いでいない（AIが強気になり、中間価格での妥協案を提示しやすくなります）
          </option>
          {/* 💡 新設オプション */}
          <option value="値下げは考えていない">
            値下げは考えていない（AI交渉をオフにし、固定価格で販売します）
          </option>
        </select>
      </div>

      {/* 🔒 最低許容価格（条件付きレンダリング） */}
      {isNegoEnabled && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <label
            style={{ fontSize: "12px", fontWeight: "bold", color: "#5b21b6" }}
          >
            🔒 最低許容価格（裏のデッドライン価格 / 円）
          </label>
          <input
            type="number"
            min="0"
            placeholder="空欄なら販売価格と同額（これ未満はAIが自動で門前払いします）"
            value={minAcceptablePrice}
            onChange={(e) => handleMinPriceChange(e.target.value)}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
            }}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: minPriceError ? "1px solid #ff4d4d" : "1px solid #c084fc",
              fontSize: "13px",
              outline: "none",
              backgroundColor: minPriceError ? "#fef2f2" : "white",
              boxSizing: "border-box",
              width: "100%",
            }}
          />
          {minPriceError ? (
            <span
              style={{ color: "#ff4d4d", fontSize: "11px", fontWeight: "bold" }}
            >
              ⚠️ {minPriceError}
            </span>
          ) : (
            <span style={{ color: "#7c3aed", fontSize: "11px" }}>
              ※ この最低価格は他のユーザー（買い手）には一切開示されません。
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default AiNegoFormSection;
