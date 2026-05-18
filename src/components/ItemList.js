import React from "react";

function ItemList({ items, handlePurchaseItem }) {
  return (
    <section style={{ textAlign: "left" }}>
      <h2
        style={{
          borderBottom: "2px solid #ff4d4d", // 🔥 メルカリレッドのアクセント
          paddingBottom: "10px",
          fontSize: "18px",
          color: "#333333",
          fontWeight: "bold",
        }}
      >
        🛒 タイムライン（出品された商品）
      </h2>

      {items.length === 0 ? (
        <p
          style={{
            color: "#999999",
            textAlign: "center",
            marginTop: "30px",
            fontSize: "15px",
          }}
        >
          商品がありません。上のフォームから出品してみましょう！
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          {items.map((item) => {
            const isSoldOut = item.status === "sold_out";

            return (
              <div
                key={item.id}
                style={{
                  background: "#ffffff", // 🔥 黒から「純白」へ
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)", // 優しい影
                  border: "1px solid #eeeeee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: isSoldOut ? 0.6 : 1,
                  transition: "transform 0.2s",
                }}
              >
                <div style={{ flex: 1, paddingRight: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "20px",
                      color: "#333333",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {item.name}
                    {isSoldOut && (
                      <span
                        style={{
                          backgroundColor: "#ff4d4d",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: "bold",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        SOLD OUT
                      </span>
                    )}
                  </h3>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#888888",
                      marginBottom: "12px",
                      fontWeight: "500",
                    }}
                  >
                    👤 出品者: {item.seller_name || "名無しさん"}
                  </div>

                  <p
                    style={{
                      color: "#666666",
                      margin: "0 0 15px 0",
                      fontSize: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    {item.description}
                  </p>

                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#ff4d4d",
                    }}
                  >
                    {item.price.toLocaleString()} 円
                  </span>
                </div>

                <div>
                  <button
                    onClick={() => handlePurchaseItem(item.id)}
                    disabled={isSoldOut}
                    style={{
                      backgroundColor: isSoldOut ? "#e0e0e0" : "#ff4d4d", // 売り切れ時は薄いグレーに
                      color: isSoldOut ? "#999999" : "white",
                      border: "none",
                      padding: "12px 22px",
                      borderRadius: "20px", // ボタンを丸っこく
                      fontSize: "15px",
                      fontWeight: "bold",
                      cursor: isSoldOut ? "not-allowed" : "pointer",
                      boxShadow: isSoldOut
                        ? "none"
                        : "0 4px 12px rgba(255, 77, 77, 0.15)",
                      transition: "all 0.2s",
                    }}
                  >
                    {isSoldOut ? "❌ 売り切れ" : "🛍️ 購入する"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ItemList;
