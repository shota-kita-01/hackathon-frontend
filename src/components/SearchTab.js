import React, { useState, useEffect } from "react";
import ItemList from "./ItemList";

function SearchTab({
  items,
  homeItems,
  handleCardClick,
  handlePurchaseItem,
  moodText,
  setMoodText,
  recommendMode, // 💡 エラー防止のため引数は維持、UIからは削除
  setRecommendMode, // 💡 エラー防止のため引数は維持、UIからは削除
  isRecommending,
  handleAiRecommend,
  handleResetRecommend,
  filterStatus,
  setFilterStatus,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("ai_match");
  const [visibleCount, setVisibleCount] = useState(20);

  // 📦 Amazonのデータセットに適合する「33個のカテゴリージャンル」を完全定義！
  // 💡 もし実際のバックエンドのジャンル名と完全一致させたい場合は、ここの文字列を書き換えてください。
  const amazon33Categories = [
    "Electronics",
    "Computers",
    "Smart Home",
    "Clothing",
    "Shoes",
    "Bags & Luggage",
    "Jewelry",
    "Watches",
    "Home & Kitchen",
    "Kitchen & Dining",
    "Furniture",
    "Bedding",
    "Beauty",
    "Health & Household",
    "Grocery & Gourmet",
    "Wine & Alcohol",
    "Baby",
    "Toys & Games",
    "Video Games",
    "Books",
    "Kindle Store",
    "Movies & TV",
    "Music & CD",
    "Sports & Outdoors",
    "Fitness",
    "Tools & Home Improvement",
    "Automotive",
    "Pet Supplies",
    "Office Products",
    "Stationery",
    "Musical Instruments",
    "Garden & Patio",
    "Hobby & Collectibles",
  ];

  // 条件が変わったら表示件数をリセット
  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, sortOrder, moodText, filterStatus]);

  // 常に最新のAIスコア付き配列をベースにする
  const baseItems =
    Array.isArray(homeItems) && homeItems.length > 0 ? homeItems : items;

  // ===================================================
  // 🔍 フィルターロジックの完全連動
  // ===================================================

  // 1. 文字列 ＆ カテゴリ選択での絞り込み
  let filteredItems = baseItems.filter((item) => {
    if (!item) return false;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Amazonの ai_category (バックエンドで tags に変換済) を最優先でチェック
    const tagMatch = item.tags
      ? String(item.tags).toLowerCase().includes(query)
      : false;
    const nameMatch = item.name
      ? item.name.toLowerCase().includes(query)
      : false;
    const descMatch = item.description
      ? item.description.toLowerCase().includes(query)
      : false;

    return tagMatch || nameMatch || descMatch;
  });

  // 2. 表示対象フィルター（販売中 / 売切）➔ Amazonの status に完全連動！
  if (filterStatus === "active") {
    filteredItems = filteredItems.filter((item) => item.status === "on_sale");
  } else if (filterStatus === "sold_out") {
    filteredItems = filteredItems.filter((item) => item.status === "sold_out");
  }

  // 3. 並び替え（AIおすすめ順、価格順、新しい順）
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

  // 「すべて」表示の時は、売り切れ(sold_out)が自然に後ろに沈むようにソート
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

      {/* 融合型検索コンソール */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
          overflow: "hidden",
        }}
      >
        {/* ─── 上段：AI Mood 検索エリア（不要なモード選択ラジオは撤去し究極にシンプル化） ─── */}
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
              AIイメージ検索（欲しい雰囲気や気分を入力）
            </h3>
          </div>

          {/* 表示対象フィルター */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              fontSize: "13px",
              color: "#374151",
              marginBottom: "15px",
              paddingBottom: "10px",
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

          {/* AI検索入力行 */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="今の気分や欲しいイメージ（例：Macに合う黒いガジェット、洗練されたオフィス服）"
              value={moodText || ""}
              onChange={(e) => setMoodText(e.target.value)}
              disabled={isRecommending}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #a5b4fc",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              className="ai-ask-button"
              onClick={handleAiRecommend}
              disabled={isRecommending || !(moodText || "").trim()}
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

        {/* ─── 下段：33カテゴリー ＆ キーワード絞り込みエリア ─── */}
        <div style={{ padding: "20px", backgroundColor: "white" }}>
          {/* 🆕 Amazon専用：33カテゴリー選択用セレクトボックス */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#4b5563",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              🏷️ <span>33ジャンルからカテゴリー指定</span>
            </div>
            <select
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                fontSize: "14px",
                color: "#374151",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">▼ 指定なし（すべてのカテゴリーを表示）</option>
              {amazon33Categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

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
              キーワードでさらにテキスト絞り込む
            </h4>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* キーワード入力窓 */}
            <input
              type="text"
              placeholder="商品名や説明文のキーワードで絞り込み（例: black, leather）"
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

          {/* クリアボタン（何か入力・選択されているときだけ出現） */}
          {searchQuery && (
            <div style={{ marginTop: "12px", textAlign: "right" }}>
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  padding: "4px 12px",
                  backgroundColor: "#f3f4f6",
                  color: "#4b5563",
                  border: "none",
                  borderRadius: "20px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                選択・入力をクリア ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 検索結果の表示エリア */}
      <div>
        <div
          style={{ fontSize: "13px", color: "#6b7280", marginBottom: "15px" }}
        >
          {sortOrder === "ai_match"
            ? "✨ AIが算出したマッチ度順: "
            : "📦 条件に合う商品: "}
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
