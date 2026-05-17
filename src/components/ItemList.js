import React from "react";

function ItemList({ items, handlePurchaseItem }) {
  return (
    <section style={{ textAlign: "left" }}>
      <h2
        style={{
          borderBottom: "2px solid #4a5568",
          paddingBottom: "10px",
          fontSize: "20px",
        }}
      >
        🛒 タイムライン（出品された商品）
      </h2>

      {items.length === 0 ? (
        <p style={{ color: "#a0aec0", textAlign: "center", marginTop: "20px" }}>
          商品がありません。上のフォームから出品してみましょう！
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#2d3748",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1, paddingRight: "20px" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "22px" }}>
                  {item.name}
                </h3>
                <p
                  style={{
                    color: "#cbd5e0",
                    margin: "0 0 15px 0",
                    fontSize: "16px",
                  }}
                >
                  {item.description}
                </p>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#ed8936",
                  }}
                >
                  {item.price.toLocaleString()} 円
                </span>
              </div>

              <div>
                <button
                  onClick={() => handlePurchaseItem(item.id)}
                  style={{
                    backgroundColor: "#e53e3e",
                    color: "white",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  🛍️ 購入する
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ItemList;
