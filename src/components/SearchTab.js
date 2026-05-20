import React, { useState, useEffect } from "react";
import ItemList from "./ItemList";

function SearchTab({
  items,
  homeItems,
  handleCardClick,
  handlePurchaseItem,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("ai_match");
  const [visibleCount, setVisibleCount] = useState(20);

  // 条件が変わったら件数をリセット
  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, sortOrder, moodText, filterStatus]);

  useEffect(() => {
    if (!moodText.trim() && recommendMode === "both") {
      setSortOrder("ai_match");
    }
  }, [moodText, recommendMode]);

  const popularTags = [
    "sneakers",
    "bag",
    "wallet",
    "watch",
    "chanel",
    "nike",
    "gold",
  ];

  // 常に最新のAIスコア付き配列をベースにする
  const baseItems =
    Array.isArray(homeItems) && homeItems.length > 0 ? homeItems : items;

  // 1. 文字列での絞り込み
  let filteredItems = baseItems.filter((item) => {
    if (!item) return false;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameMatch = item.name
      ? item.name.toLowerCase().includes(query)
      : false;
    const descMatch = item.description
      ? item.description.toLowerCase().includes(query)
      : false;
    const tagMatch = item.tags
      ? String(item.tags).toLowerCase().includes(query)
      : false;

    return nameMatch || descMatch || tagMatch;
  });

  // 2. 表示対象フィルター
  if (filterStatus === "active") {
    filteredItems = filteredItems.filter((item) => item.status === "on_sale");
  } else if (filterStatus === "sold_out") {
    filteredItems = filteredItems.filter((item) => item.status === "sold_out");
  }

  // 3. 並び替え
  let sortedItems = [...filteredItems];
  if (sortOrder === "ai_match") {
    sortedItems.sort((a, b) => {
      const scoreA = a.score !== undefined ? parseFloat(a.score) : 0;
      const scoreB = b.score !== undefined ? parseFloat(b.score) : 0;
      return scoreB - scoreA;
    });
  } else if (sortOrder === "new") {
    sortedItems.sort((a, b) => b.id - a.id);
  } else if (sortOrder === "price_asc") {
    sortedItems.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "price_desc") {
    sortedItems.sort((a, b) => b.price - a.price);
  }

  if (filterStatus === "both") {
    sortedItems.sort(
      (a, b) =>
        (a.status === "sold_out" ? 1 : 0) - (b.status === "sold_out" ? 1 : 0),
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
          margin: "0",
        }}
      >
        🔍 商品を探す
      </h2>

      {/* 🆕 ✨ 2つのボックスを1つに統合した巨大なハイブリッド検索コンソール */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
          overflow: "hidden",
        }}
      >
        {/* ─── 上段：AI Mood 検索エリア（うっすらと呼吸するパープル背景を融合） ─── */}
        <div
          className="ai-magic-box"
          style={{
            borderRadius: "20px 20px 0 0",
            border: "none",
            borderBottom: "1px solid #e5e7eb",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "18px" }}>🧠</span>
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

          {/* モード設定 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
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
              />{" "}
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
              />{" "}
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
              />{" "}
              ハイブリッド
            </label>
          </div>

          {/* 表示対象フィルター */}
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
              />{" "}
              すべて
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
              />{" "}
              販売中
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
              />{" "}
              売切
            </label>
          </div>

          {/* AI気分の入力行 */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder={
                recommendMode === "history"
                  ? "過去の履歴から自動計算中..."
                  : "今の気分や欲しいイメージ（例：爽やかな春服、大容量の財布）"
              }
              value={moodText || ""}
              onChange={(e) => setMoodText(e.target.value)}
              disabled={recommendMode === "history" || isRecommending}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #a5b4fc",
                fontSize: "14px",
                outline: "none",
                backgroundColor:
                  recommendMode === "history" ? "#f3f4f6" : "white",
              }}
            />
            <button
              className="ai-ask-button"
              onClick={handleAiRecommend}
              disabled={
                isRecommending ||
                (recommendMode !== "history" && !(moodText || "").trim())
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

        {/* ─── 下段：キーワード・タグによる詳細絞り込みエリア ─── */}
        <div style={{ padding: "20px", backgroundColor: "white" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "16px" }}>🔍</span>
            <h4
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: "bold",
                color: "#4b5563",
              }}
            >
              キーワード・タグでさらに絞り込む
            </h4>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            {/* キーワード入力窓 */}
            <input
              type="text"
              placeholder="結果からさらに絞り込むキーワード（例: black, nike）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
              }}
            />

            {/* 並び替えセレクト */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontWeight: "bold", color: "#4b5563" }}>
                ⇅ 並び替え:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  fontSize: "13px",
                  color: "#374151",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="ai_match">🤖 AIおすすめ順</option>
                <option value="new">🆕 新しい順</option>
                <option value="price_asc">🪙 価格の安い順</option>
                <option value="price_desc">💎 価格の高い順</option>
              </select>
            </div>
          </div>

          {/* 人気タグ */}
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#9ca3af",
                marginBottom: "6px",
              }}
            >
              🔥 人気のタグ
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  style={{
                    padding: "5px 12px",
                    backgroundColor:
                      searchQuery === tag ? "#ff4d4d" : "#f3f4f6",
                    color: searchQuery === tag ? "white" : "#4b5563",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  #{tag}
                </button>
              ))}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    padding: "5px 12px",
                    backgroundColor: "#e5e7eb",
                    color: "#4b5563",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  クリア ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 検索結果の表示エリア */}
      <div>
        <div
          style={{ fontSize: "13px", color: "#6b7280", marginBottom: "15px" }}
        >
          {sortOrder === "ai_match"
            ? "✨ AIが算出したマッチ度順: "
            : "📦 条件に合う商品: "}{" "}
          <b>{sortedItems.length}</b> 件
        </div>

        {sortedItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "40px 0",
              fontSize: "14px",
            }}
          >
            該当する商品が見つかりませんでした。
          </div>
        ) : (
          <>
            <div onClick={(e) => handleCardClick(e, sortedItems)}>
              <ItemList
                items={sortedItems.slice(0, visibleCount)}
                handlePurchaseItem={handlePurchaseItem}
              />
            </div>

            {sortedItems.length > visibleCount && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: "white",
                    color: "#ff4d4d",
                    border: "2px solid #ff4d4d",
                    borderRadius: "25px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  👇 さらに商品を表示する
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchTab;
