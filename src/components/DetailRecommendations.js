import React from "react";
import { Brain, TrendingUp, Loader2 } from "lucide-react";

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
      {/* 1段目：空間的類似 */}
      <div>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: "13px",
            color: "#4f46e5",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Brain size={14} color="#4f46e5" />{" "}
          <span>この商品と似ているアイテム </span>
        </h4>
        {isCalculating ? (
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#6b7280",
              padding: "20px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Loader2 size={14} className="animate-spin" color="#6b7280" />{" "}
            <span>高速計算中...</span>
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
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.transform = "translateY(0)";
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
                  color: "#9ca3af",
                  textAlign: "center",
                  width: "100%",
                  padding: "20px 10px",
                  border: "1px dashed #e5e7eb",
                  borderRadius: "12px",
                  backgroundColor: "#fafafa",
                }}
              >
                関連商品が見つかりませんでした
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2段目：確率的時間遷移 */}
      <div>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: "13px",
            color: "#10b981",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <TrendingUp size={14} color="#10b981" />{" "}
          <span>この商品を見ている人におすすめ</span>
        </h4>
        {isCalculating ? (
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#6b7280",
              padding: "20px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Loader2 size={14} className="animate-spin" color="#6b7280" />
            <span>確率遷移シミュレート中...</span>
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
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.transform = "translateY(0)";
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
                  color: "#9ca3af",
                  textAlign: "center",
                  width: "100%",
                  padding: "20px 10px",
                  border: "1px dashed #e5e7eb",
                  borderRadius: "12px",
                  backgroundColor: "#fafafa",
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
