import React from "react";
import { User, ShoppingBag, XCircle } from "lucide-react";

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
                color: item.status === "sold_out" ? "#9ca3af" : "#111827",
              }}
            >
              {item.name}
            </h3>
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <User size={13} color="#9ca3af" />
            <span>出品者: {item.seller_name || "Amazon公式"}</span>
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

          {/* 【安全防弾ガード】item.tags が文字列のときだけ安全にスプリットしてループを回す */}
          {item.tags && typeof item.tags === "string" && (
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
            {/* 🛡️【重要】オプショナルチェーニング (?.) とフォールバック (|| 0) で即死クラッシュを完全無効化 */}
            <span
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: item.status === "sold_out" ? "#9ca3af" : "#ff4d4d",
              }}
            >
              {(item.price ?? 0).toLocaleString()} 円
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
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <XCircle size={14} color="#9ca3af" />{" "}
                {/* 💡 ❌をXCircleへ変更 */}
                <span>売り切れ</span>
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
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ShoppingBag size={14} color="white" />{" "}
                {/* 💡 🛍️をShoppingBagへ変更 */}
                <span>購入する</span>
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
