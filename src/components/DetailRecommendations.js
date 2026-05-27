import React from "react";

function DetailRecommendations({
  isCalculating,
  spaceItems,
  timeItems,
  setSelectedItem,
}) {
  return (
    <div
      style={{
        marginTop: "30px",
        paddingTop: "5px",
        borderTop: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        gap: "25px",
      }}
    >
      {/* 🥇 1段目：空間的類似 */}
      <div>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: "13px",
            color: "#4f46e5",
            fontWeight: "bold",
          }}
        >
          🧠 この商品と似ているアイテム (空間的類似)
        </h4>
        {isCalculating ? (
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#666",
              padding: "10px",
            }}
          >
            ⏳ 高速空間計算中...
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            {spaceItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#ff4d4d",
                    fontWeight: "bold",
                  }}
                >
                  {item.price.toLocaleString()} 円
                </div>
              </div>
            ))}
            {spaceItems.length === 0 && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#aaa",
                  textAlign: "center",
                  width: "100%",
                  padding: "10px",
                }}
              >
                関連商品が見つかりませんでした
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🥈 2段目：確率的時間遷移 */}
      <div>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: "13px",
            color: "#10b981",
            fontWeight: "bold",
          }}
        >
          ✨ この商品を見ている人におすすめ (こんな商品も見ています)
        </h4>
        {isCalculating ? (
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#666",
              padding: "10px",
            }}
          >
            ⏳ 確率遷移シミュレート中...
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            {timeItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#ff4d4d",
                    fontWeight: "bold",
                  }}
                >
                  {item.price.toLocaleString()} 円
                </div>
              </div>
            ))}
            {timeItems.length === 0 && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#aaa",
                  textAlign: "center",
                  width: "100%",
                  padding: "10px",
                }}
              >
                次の候補が見つかりませんでした
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailRecommendations;
