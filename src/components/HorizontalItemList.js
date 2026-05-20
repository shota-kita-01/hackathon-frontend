import React from "react";

// 🆕 引数（プロップス）に handleCardClick を追加
function HorizontalItemList({ items, handlePurchaseItem, handleCardClick }) {
  if (!items || items.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          color: "#9ca3af",
          fontSize: "13px",
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px dashed #d1d5db",
          textAlign: "center",
        }}
      >
        データがありません。
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        overflowX: "auto",
        gap: "15px",
        paddingBottom: "15px",
        paddingLeft: "4px",
        paddingRight: "4px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="item-card"
          // 🆕 1つ1つの商品カードがクリックされたときに、その商品単体のオブジェクト(item)を投げるように修正
          onClick={() => handleCardClick && handleCardClick(item)}
          style={{
            minWidth: "160px",
            maxWidth: "160px",
            backgroundColor: item.status === "sold_out" ? "#f9fafb" : "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              backgroundColor: "#f3f4f6",
            }}
          >
            <img
              src={item.image_url}
              alt={item.name}
              style={{
                width: "100%",
                height: "140px",
                objectFit: "cover",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                display: "block",
                opacity: item.status === "sold_out" ? 0.4 : 1,
                filter: item.status === "sold_out" ? "grayscale(100%)" : "none",
                transition: "all 0.3s ease",
              }}
            />
            {item.status === "sold_out" && (
              <div className="sold-ribbon-container">
                <span className="sold-ribbon-text">SOLD</span>
              </div>
            )}
          </div>

          <div
            style={{
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: item.status === "sold_out" ? "#9ca3af" : "#374151",
              }}
            >
              {item.name}
            </h3>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: item.status === "sold_out" ? "#9ca3af" : "#ff4d4d",
              }}
            >
              {item.price.toLocaleString()} 円
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HorizontalItemList;
