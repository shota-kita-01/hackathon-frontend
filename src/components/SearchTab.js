import React, { useState } from "react";
import ItemList from "./ItemList";

function SearchTab({ items, handleCardClick, handlePurchaseItem }) {
  const [searchQuery, setSearchQuery] = useState("");

  // デモ映えする「人気タグ」のプリセット
  const popularTags = [
    "sneakers",
    "bag",
    "wallet",
    "watch",
    "chanel",
    "nike",
    "gold",
  ];

  // 📐 【リアルタイム多重フィルタ回路】
  // 商品名(name)、説明文(description)、そして新設したタグ(tags)の中に検索文字が含まれているかを全件走査
  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; // 空白の時は全件表示

    const matchName = item.name?.toLowerCase().includes(query);
    const matchDesc = item.description?.toLowerCase().includes(query);
    const matchTags = item.tags?.toLowerCase().includes(query);

    return matchName || matchDesc || matchTags;
  });

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
      <div style={{ marginBottom: "20px" }}>
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
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* 🏷️ 人気タグのパチポチショートカット */}
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
              onClick={() => setSearchQuery(tag)} // タップしたら検索窓にそのタグを代入する神UX
              style={{
                padding: "6px 14px",
                backgroundColor: searchQuery === tag ? "#ff4d4d" : "white",
                color: searchQuery === tag ? "white" : "#4b5563",
                border: "1px solid #d1d5db",
                borderRadius: "20px",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.1s",
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

      {/* 🛒 検索結果タイムライン */}
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
        <div
          style={{ fontSize: "13px", color: "#6b7280", marginBottom: "15px" }}
        >
          該当する商品: <b>{filteredItems.length}</b> 件
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
            お探しのキーワードに一致する商品は見つかりませんでした。
          </div>
        ) : (
          <div onClick={(e) => handleCardClick(e, filteredItems)}>
            <ItemList
              items={filteredItems}
              handlePurchaseItem={handlePurchaseItem}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchTab;
