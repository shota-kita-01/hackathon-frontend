import React from "react";

function AiRecommendForm({
  moodText,
  setMoodText,
  recommendMode,
  setRecommendMode,
  isRecommending,
  handleAiRecommend,
  handleResetRecommend,
  filterStatus,
  setFilterStatus,
}) {
  return (
    // 🆕 クラス名 "ai-magic-box" を適用して呼吸する背景に
    <div className="ai-magic-box">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span role="img" aria-label="brain" style={{ fontSize: "18px" }}>
          🧠
        </span>
        <h3
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "bold",
            color: "#312e81",
          }}
        >
          AI Mood Recommendation (Two-Tower Model)
        </h3>
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          fontSize: "13px",
          color: "#4338ca",
          marginBottom: "10px",
        }}
      >
        <label
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <input
            type="radio"
            name="mode"
            value="mood"
            checked={recommendMode === "mood"}
            onChange={() => setRecommendMode("mood")}
          />
          今の気分重視
        </label>
        <label
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <input
            type="radio"
            name="mode"
            value="history"
            checked={recommendMode === "history"}
            onChange={() => setRecommendMode("history")}
          />
          過去の好み重視 (履歴)
        </label>
        <label
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <input
            type="radio"
            name="mode"
            value="both"
            checked={recommendMode === "both"}
            onChange={() => setRecommendMode("both")}
          />
          ハイブリッド (両方ミックス)
        </label>
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          fontSize: "13px",
          color: "#374151",
          marginBottom: "15px",
          borderTop: "1px dashed #c7d2fe",
          paddingTop: "10px",
        }}
      >
        <span style={{ fontWeight: "bold", color: "#1f2937" }}>
          🛒 表示対象:
        </span>
        <label
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <input
            type="radio"
            name="filter_status"
            value="both"
            checked={filterStatus === "both"}
            onChange={() => setFilterStatus("both")}
          />
          すべて (売切は後回し)
        </label>
        <label
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <input
            type="radio"
            name="filter_status"
            value="active"
            checked={filterStatus === "active"}
            onChange={() => setFilterStatus("active")}
          />
          販売中のみ
        </label>
        <label
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <input
            type="radio"
            name="filter_status"
            value="sold_out"
            checked={filterStatus === "sold_out"}
            onChange={() => setFilterStatus("sold_out")}
          />
          売り切れのみ
        </label>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder={
            recommendMode === "history"
              ? "過去の履歴から自動計算中..."
              : "気分を入力（例：ゴールド、スニーカー、luxury ring）"
          }
          value={moodText}
          onChange={(e) => setMoodText(e.target.value)}
          disabled={recommendMode === "history" || isRecommending}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #a5b4fc",
            fontSize: "14px",
            outline: "none",
            backgroundColor: recommendMode === "history" ? "#f3f4f6" : "white",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
          }}
        />

        {/* 🆕 クラス名 "ai-ask-button" を適用してネオン発光ボタンに */}
        <button
          className="ai-ask-button"
          onClick={handleAiRecommend}
          disabled={
            isRecommending || (recommendMode !== "history" && !moodText.trim())
          }
        >
          {isRecommending ? "⏳ 計算中..." : "Ask AI ✨"}
        </button>

        <button
          onClick={handleResetRecommend}
          style={{
            padding: "10px 15px",
            backgroundColor: "white",
            color: "#4f46e5",
            border: "1px solid #a5b4fc",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default AiRecommendForm;
