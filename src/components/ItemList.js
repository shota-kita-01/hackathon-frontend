import React from "react";

function ItemList({ items, handlePurchaseItem }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="item-card"
          style={{
            // 👇 1. 売り切れならカード全体の背景を少しグレーにする
            backgroundColor: item.status === "sold_out" ? "#f9fafb" : "white",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              borderRadius: "12px",
              backgroundColor: "#f3f4f6",
            }}
          >
            <img
              src={item.image_url}
              alt={item.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "12px",
                display: "block",
                // 👇 2. 画像は完全に白黒(100%)にして、さらに薄く(0.4)する
                opacity: item.status === "sold_out" ? 0.4 : 1,
                filter: item.status === "sold_out" ? "grayscale(100%)" : "none",
                transition: "all 0.3s ease",
              }}
            />
            {item.status === "sold_out" && (
              <div className="sold-ribbon-container-large">
                <span className="sold-ribbon-text-large">SOLD</span>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "bold",
                // 👇 3. タイトルの文字色も、売り切れならグレーにする
                color: item.status === "sold_out" ? "#9ca3af" : "#111827",
              }}
            >
              {item.name}
            </h3>
          </div>

          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            👤 出品者: {item.seller_name || "名無しさん"}
          </div>

          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: 0,
              whiteSpace: "pre-wrap",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.description}
          </p>

          {item.tags && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              {item.tags.split(",").map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontWeight: "500",
                    // 👇 タグの色もグレーアウト
                    color: item.status === "sold_out" ? "#6b7280" : "#4f46e5",
                    backgroundColor:
                      item.status === "sold_out" ? "#e5e7eb" : "#e0e7ff",
                  }}
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #f3f4f6",
              paddingTop: "12px",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                // 👇 4. 価格の「赤色」も、売り切れならグレーにする
                color: item.status === "sold_out" ? "#9ca3af" : "#ff4d4d",
              }}
            >
              {item.price.toLocaleString()} 円
            </span>

            {item.status === "sold_out" ? (
              <button
                disabled
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e5e7eb",
                  color: "#9ca3af",
                  border: "none",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "not-allowed",
                }}
              >
                ❌ 売り切れ
              </button>
            ) : (
              <button
                onClick={() => handlePurchaseItem(item.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ff4d4d",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(255,77,77,0.2)",
                }}
              >
                🛍️ 購入する
              </button>
            )}
          </div>

          {item.score !== undefined && item.score > 0 && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                backgroundColor: "rgba(79, 70, 229, 0.9)",
                color: "white",
                padding: "4px 8px",
                borderRadius: "8px",
                fontSize: "10px",
                fontWeight: "bold",
                fontFamily: "monospace",
                backdropFilter: "blur(4px)",
              }}
            >
              Match: {(item.score * 100).toFixed(1)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ItemList;
