import React from "react";

function AiRecommendForm({
  moodText,
  setMoodText,
  recommendMode,
  setRecommendMode,
  isRecommending,
  handleAiRecommend,
  handleResetRecommend,
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        border: "1px solid #e0e7ff",
      }}
    >
      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: "14px",
          fontWeight: "bold",
          color: "#312e81",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        🧠 AI Mood Recommendation (Two-Tower Model)
      </h3>

      {/* モード切り替えラジオボタンエリア */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "12px",
          fontSize: "13px",
          fontWeight: "500",
          color: "#4f46e5",
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
            name="recommendMode"
            value="mood"
            checked={recommendMode === "mood"}
            onChange={(e) => setRecommendMode(e.target.value)}
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
            name="recommendMode"
            value="history"
            checked={recommendMode === "history"}
            onChange={(e) => setRecommendMode(e.target.value)}
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
            name="recommendMode"
            value="both"
            checked={recommendMode === "both"}
            onChange={(e) => setRecommendMode(e.target.value)}
          />
          ハイブリッド (両方ミックス)
        </label>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder={
            recommendMode === "history"
              ? "購入履歴から自動計算するため入力不要です"
              : "気分を入力（例：ゴールド、スニーカー、luxury ring）"
          }
          value={moodText}
          disabled={recommendMode === "history"}
          onChange={(e) => setMoodText(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #c7d2fe",
            fontSize: "14px",
            outline: "none",
            backgroundColor: recommendMode === "history" ? "#e2e8f0" : "white",
          }}
        />
        <button
          onClick={handleAiRecommend}
          disabled={
            isRecommending || (recommendMode !== "history" && !moodText.trim())
          }
          style={{
            padding: "10px 20px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {isRecommending ? "Calculating..." : "Ask AI"}
        </button>
        <button
          onClick={handleResetRecommend}
          style={{
            padding: "10px 14px",
            backgroundColor: "white",
            color: "#4f46e5",
            border: "1px solid #c7d2fe",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "14px",
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
