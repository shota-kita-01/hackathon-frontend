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

  // 🧠 各スタンスの数理ロジックを直感的に説明する動的テキスト辞書
  const stanceDescriptions = {
    売り切りたい: (
      <div
        style={{
          fontSize: "12px",
          color: "#16a34a",
          backgroundColor: "#f0fdf4",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #bbf7d0",
          lineHeight: "1.5",
        }}
      >
        <strong>🕊️ すぐに売り切りたい（ハト派モード）</strong>
        <br />
        AIが値引き・即時成立に非常に寛容になります。入力いただいた最低価格以上で交渉された場合、相手の希望額のまま
        <strong>交渉を自動で一発成立（即時決済）</strong>させます。
      </div>
    ),
    急いでいない: (
      <div
        style={{
          fontSize: "12px",
          color: "#d97706",
          backgroundColor: "#fffbeb",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #fef3c7",
          lineHeight: "1.5",
        }}
      >
        <strong>🦅 急いでいない（タカ派モード）</strong>
        <br />
        AIが出品者利益の最大化を狙って強気になります。入力いただいた最低価格以上の交渉であっても即座に承諾せず、現在価格と買い手希望額の中間付近を計算し、
        <strong>AIがスマートな妥協案（カウンター）を提示して両者へ仲裁</strong>
        します。
      </div>
    ),
    値下げは考えていない: (
      <div
        style={{
          fontSize: "12px",
          color: "#2563eb",
          backgroundColor: "#eff6ff",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #bfdbfe",
          lineHeight: "1.5",
        }}
      >
        <strong>🔒 値下げは考えていない（完全固定モード）</strong>
        <br />
        AI自動交渉を完全にオフにします。購入者側の画面には価格交渉ボタン自体が表示されなくなり、メルカリ本来の固定価格のみでのクリーンな販売となります。
      </div>
    ),
  };

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
            marginBottom: "2px",
          }}
        >
          🤖 AI代理交渉（おまかせ調停）のパラメータ設定
        </span>
        <span style={{ fontSize: "11px", color: "#7c3aed" }}>
          購入者からの値引き打診をAIエージェントに自動返答させる裏ルールを定義します。
        </span>
      </div>

      {/* 🛡️ 🔑 矛盾を解消したセキュリティアナウンスバナー */}
      <div
        style={{
          backgroundColor: "#faf5ff",
          border: "1px solid #e9d5ff",
          borderRadius: "8px",
          padding: "10px 12px",
          fontSize: "11px",
          color: "#5b21b6",
          lineHeight: "1.4",
        }}
      >
        <strong>⚠️ 🔒 セキュリティルール（完全非公開情報）</strong>
        <div style={{ marginTop: "3px", color: "#6b21a8" }}>
          交渉有効時の<strong>【出品スタンス】</strong>
          および<strong>【最低許容価格】</strong>
          は、他のユーザー（買い手）にはシステム上一切開示されません。裏側のAI調停のロジックにのみ安全に使用されます。
        </div>
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
          <option value="売り切りたい">すぐに売り切りたい</option>
          <option value="急いでいない">急いでいない</option>
          <option value="値下げは考えていない">値下げは考えていない</option>
        </select>
      </div>

      {/* 💡 選んだスタンスに応じて、数理的な挙動説明を動的にマウントするエリア */}
      {sellerStance && (
        <div style={{ animation: "fadeIn 0.2s ease-out" }}>
          {stanceDescriptions[sellerStance]}
        </div>
      )}

      {/* 🔒 最低許容価格（条件付きレンダリング） */}
      {isNegoEnabled && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            animation: "fadeIn 0.2s ease-out",
            marginTop: "4px",
          }}
        >
          {/* 💡 ラベルに赤い必須マークを追加 */}
          <label
            style={{ fontSize: "12px", fontWeight: "bold", color: "#5b21b6" }}
          >
            🔒 最低許容価格（裏のデッドライン価格 / 円）{" "}
            <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          {/* 💡 プレースホルダーを必須用の文言に調整 */}
          <input
            type="number"
            min="0"
            placeholder="交渉に応じる最低許容金額を記入してください"
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
            <span
              style={{ color: "#7c3aed", fontSize: "11px", fontWeight: "500" }}
            >
              ※
              繰り返しますが、あなたが設定したデッドライン金額や内部パラメータが買い手に漏れることは絶対にありません。
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default AiNegoFormSection;
