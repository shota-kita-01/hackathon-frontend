import React, { useState, useEffect } from "react";
import ItemList from "./ItemList";

function SearchTab({ items, handleCardClick, handlePurchaseItem }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("both");

  // 🆕 表示件数を管理するState（初期値20件）
  const [visibleCount, setVisibleCount] = useState(20);

  // 🆕 検索キーワードやフィルターを変えたら、表示件数を最初の20件に戻す親切設計
  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, filterStatus]);

  const popularTags = [
    "sneakers",
    "bag",
    "wallet",
    "watch",
    "chanel",
    "nike",
    "gold",
  ];

  // 1. 文字列での絞り込み
  let filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.tags?.toLowerCase().includes(query)
    );
  });

  // 2. ステータスでの絞り込み
  if (filterStatus === "active") {
    filteredItems = filteredItems.filter((item) => item.status === "on_sale");
  } else if (filterStatus === "sold_out") {
    filteredItems = filteredItems.filter((item) => item.status === "sold_out");
  } else if (filterStatus === "both") {
    // 3. 「両方」の場合は、売り切れ(sold_out)を配列の後ろにソート（並び替え）する
    filteredItems.sort(
      (a, b) =>
        (a.status === "sold_out" ? 1 : 0) - (b.status === "sold_out" ? 1 : 0),
    );
  }

  return (
    <div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
          margin: "0 0 15px 0",
        }}
      >
        🔍 商品を探す
      </h2>

      {/* 検索入力窓 */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="キーワードやタグで検索（例: nike, wallet）"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid #d1d5db",
            fontSize: "15px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* 表示対象フィルターのラジオボタン */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          fontSize: "13px",
          color: "#374151",
          marginBottom: "20px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>🛒 表示対象:</span>
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
            checked={filterStatus === "both"}
            onChange={() => setFilterStatus("both")}
          />{" "}
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
            checked={filterStatus === "active"}
            onChange={() => setFilterStatus("active")}
          />{" "}
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
            checked={filterStatus === "sold_out"}
            onChange={() => setFilterStatus("sold_out")}
          />{" "}
          売り切れのみ
        </label>
      </div>

      {/* 人気タグ */}
      <div style={{ marginBottom: "25px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            color: "#6b7280",
            marginBottom: "8px",
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
                padding: "6px 14px",
                backgroundColor: searchQuery === tag ? "#ff4d4d" : "white",
                color: searchQuery === tag ? "white" : "#4b5563",
                border: "1px solid #d1d5db",
                borderRadius: "20px",
                fontSize: "13px",
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
                padding: "6px 14px",
                backgroundColor: "#f3f4f6",
                color: "#9ca3af",
                border: "1px solid #e5e7eb",
                borderRadius: "20px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              クリア ✕
            </button>
          )}
        </div>
      </div>

      {/* 検索結果 */}
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
        <div
          style={{ fontSize: "13px", color: "#6b7280", marginBottom: "15px" }}
        >
          該当: <b>{filteredItems.length}</b> 件
        </div>
        {filteredItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "40px 0",
              fontSize: "14px",
            }}
          >
            見つかりませんでした。
          </div>
        ) : (
          <>
            {/* 🆕 配列をsliceでぶった切って表示件数を絞り込む */}
            <div onClick={(e) => handleCardClick(e, filteredItems)}>
              <ItemList
                items={filteredItems.slice(0, visibleCount)}
                handlePurchaseItem={handlePurchaseItem}
              />
            </div>

            {/* 🆕 配列の全体数が、現在表示している件数よりも多い場合だけ「もっと見る」ボタンを出現させる */}
            {filteredItems.length > visibleCount && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  marginBottom: "40px",
                }}
              >
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
                  👇 さらに商品を表示する (Load More)
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
