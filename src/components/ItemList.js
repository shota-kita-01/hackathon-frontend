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
          {items.map((item) => {
            // 🌟 売り切れかどうかを判定する変数を作っておく
            const isSoldOut = item.status === "sold_out";

            return (
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
                  // 💡 売り切れている商品は、カード全体を少し薄暗くして見やすくする工夫
                  opacity: isSoldOut ? 0.6 : 1,
                }}
              >
                <div style={{ flex: 1, paddingRight: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 5px 0",
                      fontSize: "22px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {item.name}
                    {/* 🌟 売り切れている場合だけ、真っ赤な【SOLD OUT】バッジを横に出現させる！ */}
                    {isSoldOut && (
                      <span
                        style={{
                          backgroundColor: "#e53e3e",
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "bold",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        SOLD OUT
                      </span>
                    )}
                  </h3>

                  {/* 🌟 出品者の名前を表示（古いテストデータ等で空なら「名無しさん」にする） */}
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#a0aec0",
                      marginBottom: "10px",
                    }}
                  >
                    👤 出品者: {item.seller_name || "名無しさん"}
                  </div>

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
                  {/* 🌟 購入ボタンの挙動と見た目を、商品のステータスで切り替える */}
                  <button
                    onClick={() => handlePurchaseItem(item.id)}
                    disabled={isSoldOut} // 💡 売り切れならボタンを物理的にクリック不可にする
                    style={{
                      backgroundColor: isSoldOut ? "#4a5568" : "#e53e3e", // 💡 売り切れならグレー、売ってたら赤
                      color: isSoldOut ? "#a0aec0" : "white",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: isSoldOut ? "not-allowed" : "pointer", // 💡 売り切れなら駐車禁止マークみたいなマウスカーソルにする
                      transition: "background 0.2s",
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
