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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [keywordFilter, setKeywordFilter] = useState("");

  const [sortOrder, setSortOrder] = useState("ai_match");
  const [visibleCount, setVisibleCount] = useState(20);

  // 💡 【修正】厳選された22カテゴリー（アルファベット順）に完全リプレイス！
  const curated22Categories = [
    "All_Beauty",
    "Amazon_Fashion",
    "Appliances",
    "Automotive",
    "Beauty_and_Personal_Care",
    "Books",
    "CDs_and_Vinyl",
    "Cell_Phones_and_Accessories",
    "Clothing_Shoes_and_Jewelry",
    "Electronics",
    "Grocery_and_Gourmet_Food",
    "Handmade_Products",
    "Home_and_Kitchen",
    "Movies_and_TV",
    "Musical_Instruments",
    "Office_Products",
    "Patio_Lawn_and_Garden",
    "Pet_Supplies",
    "Sports_and_Outdoors",
    "Tools_and_Home_Improvement",
    "Toys_and_Games",
    "Video_Games",
  ];

  // 検索条件が変わったら表示件数をリセット
  useEffect(() => {
    setVisibleCount(20);
  }, [categoryFilter, keywordFilter, sortOrder, moodText, filterStatus]);

  // AI検索結果があればそれを、なければ全アイテムをベースにする
  const baseItems =
    Array.isArray(homeItems) && homeItems.length > 0 ? homeItems : items;

  // ===================================================
  // 🔍 フィルターロジックの完全連動（AI空間 × 物理フィルター）
  // ===================================================
  let filteredItems = baseItems.filter((item) => {
    if (!item) return false;

    // 1. 💡 【バグ修正】item.tags から DBスキーマに合わせた item.ai_category へ変更！
    if (categoryFilter && item.ai_category !== categoryFilter) return false;

    // 2. キーワードフィルター
    if (keywordFilter) {
      const query = keywordFilter.toLowerCase().trim();
      // 💡 こちらも item.ai_category に安全に同期
      const tagMatch = item.ai_category
        ? String(item.ai_category).toLowerCase().includes(query)
        : false;
      const nameMatch = item.name
        ? item.name.toLowerCase().includes(query)
        : false;
      const descMatch = item.description
        ? item.description.toLowerCase().includes(query)
        : false;
      if (!tagMatch && !nameMatch && !descMatch) return false;
    }

    // 3. 販売ステータスフィルター
    if (filterStatus === "active" && item.status !== "on_sale") return false;
    if (filterStatus === "sold_out" && item.status !== "sold_out") return false;

    return true;
  });

  // ===================================================
  // ⇅ 並び替えロジック
  // ===================================================
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
        🔍 AI 空間検索
      </h2>

      {/* 🚀 AI Mood 検索エリア */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "22px" }}>✨</span>
            <h3
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: "900",
                color: "#312e81",
                letterSpacing: "0.5px",
              }}
            >
              AIに欲しいイメージを伝える
            </h3>
          </div>

          <div
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="例：週末のカフェに合う落ち着いた服、Macに合う黒いガジェット"
                value={moodText || ""}
                onChange={(e) => setMoodText(e.target.value)}
                disabled={isRecommending}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "2px solid #a5b4fc",
                  fontSize: "15px",
                  outline: "none",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                }}
              />
              <button
                onClick={handleAiRecommend}
                disabled={isRecommending || !(moodText || "").trim()}
                style={{
                  padding: "0 24px",
                  backgroundColor:
                    isRecommending || !(moodText || "").trim()
                      ? "#c7d2fe"
                      : "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "900",
                  fontSize: "15px",
                  cursor:
                    isRecommending || !(moodText || "").trim()
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    isRecommending || !(moodText || "").trim()
                      ? "none"
                      : "0 4px 6px rgba(79, 70, 229, 0.3)",
                }}
              >
                {isRecommending ? "⏳ 計算中..." : "検索する"}
              </button>
            </div>

            {baseItems === homeItems && homeItems.length > 0 && (
              <div style={{ textAlign: "right" }}>
                <button
                  onClick={() => {
                    handleResetRecommend();
                    setCategoryFilter("");
                    setKeywordFilter("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: "13px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  検索結果をリセット
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 下段：物理フィルター */}
        <div style={{ padding: "20px", backgroundColor: "white" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              marginBottom: "15px",
            }}
          >
            <div style={{ flex: "1 1 200px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                🛒 表示対象
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  fontSize: "13px",
                  color: "#374151",
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
                    value="sold_out"
                    checked={filterStatus === "sold_out"}
                    onChange={() => setFilterStatus("sold_out")}
                  />{" "}
                  売切
                </label>
              </div>
            </div>

            {/* カテゴリ選択 */}
            <div style={{ flex: "1 1 200px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                🏷️ カテゴリー
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">▼ すべてのカテゴリー</option>
                {/* 💡 【修正】新しく定義した curated22Categories で map を回します */}
                {curated22Categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="さらにキーワードで絞り込む（例: black, leather）"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "13px",
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontWeight: "bold", color: "#4b5563" }}>⇅</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="ai_match">🤖 AIおすすめ順</option>
                <option value="new">🆕 新しい順</option>
                <option value="price_asc">🪙 安い順</option>
                <option value="price_desc">💎 高い順</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 検索結果表示エリア ─── */}
      <div>
        <div
          style={{ fontSize: "13px", color: "#6b7280", marginBottom: "15px" }}
        >
          {sortOrder === "ai_match" &&
          baseItems === homeItems &&
          homeItems.length > 0
            ? "✨ 768次元空間ベクトル・マッチ度順: "
            : "📦 表示中の商品: "}
          <b style={{ color: "#111827", fontSize: "15px" }}>
            {filteredItems.length}
          </b>{" "}
          件
        </div>

        {filteredItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "60px 0",
              fontSize: "14px",
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px dashed #d1d5db",
            }}
          >
            該当する商品が見つかりませんでした。
            <br />
            条件を変えてみてください。
          </div>
        ) : (
          <>
            <div onClick={(e) => handleCardClick(e, filteredItems)}>
              <ItemList
                items={filteredItems.slice(0, visibleCount)}
                handlePurchaseItem={handlePurchaseItem}
              />
            </div>

            {filteredItems.length > visibleCount && (
              <div style={{ textAlign: "center", marginTop: "30px" }}>
                <button
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  style={{
                    padding: "14px 40px",
                    backgroundColor: "white",
                    color: "#ff4d4d",
                    border: "2px solid #ff4d4d",
                    borderRadius: "30px",
                    fontWeight: "900",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(255, 77, 77, 0.1)",
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
