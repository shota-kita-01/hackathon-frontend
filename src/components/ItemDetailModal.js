import React, { useState, useEffect } from "react";

function ItemDetailModal({
  selectedItem,
  setSelectedItem,
  handlePurchaseItem,
  myAppId,
  userLikes,
  onLikeToggle,
}) {
  const [relatedItems, setRelatedItems] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // 🆕 自分がこの商品をいいねしているかを数理的に判定
  const isLiked = userLikes.some((like) => like.id === selectedItem?.id);

  useEffect(() => {
    if (!selectedItem || !myAppId) return;

    // 🚀 【新機能】① 閲覧履歴APIをバックエンドに自動送信（バックグラウンド処理）
    fetch(`${API_URL}/items/${selectedItem.id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    }).catch((err) => console.error("閲覧履歴記録エラー:", err));

    // 🧠 ② 関連商品AI推薦の計算（前回作成ロジック）
    setIsCalculating(true);
    setRelatedItems([]);
    fetch(`${API_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: myAppId,
        mood_text: selectedItem.name,
        mode: "mood",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter((item) => item.id !== selectedItem.id);
          setRelatedItems(filtered.slice(0, 3));
        }
      })
      .catch((err) => console.error("関連商品取得エラー:", err))
      .finally(() => setIsCalculating(false));
  }, [selectedItem, myAppId]);

  // 🆕 【新機能】いいねボタンが押された時の処理
  const handleLikeClick = () => {
    if (!myAppId || !selectedItem) return;

    fetch(`${API_URL}/items/${selectedItem.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          onLikeToggle(); // 親コンポーネント（App.js）のいいね一覧を最新に更新させる
        }
      })
      .catch((err) => console.error("いいね通信エラー:", err));
  };

  if (!selectedItem) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          maxWidth: "500px",
          width: "100%",
          padding: "25px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
            🛍️ 商品詳細
          </h2>
          <button
            onClick={() => setSelectedItem(null)}
            style={{
              border: "none",
              backgroundColor: "transparent",
              fontSize: "20px",
              cursor: "pointer",
              color: "#aaa",
            }}
          >
            ✕
          </button>
        </div>

        <img
          src={selectedItem.image_url}
          alt={selectedItem.name}
          style={{
            width: "100%",
            height: "220px",
            objectFit: "cover",
            borderRadius: "12px",
            marginBottom: "15px",
          }}
        />

        {/* 🆕 タイトルの横に可愛い「いいねトグルボタン」を設置 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", flex: 1 }}>
            {selectedItem.name}
          </h3>
          <button
            onClick={handleLikeClick}
            style={{
              backgroundColor: isLiked ? "#fff1f2" : "#f3f4f6",
              color: isLiked ? "#f43f5e" : "#9ca3af",
              border: isLiked ? "1px solid #fecdd3" : "1px solid #e5e7eb",
              borderRadius: "30px",
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s",
            }}
          >
            {isLiked ? "❤️ いいね中" : "🤍 いいね"}
          </button>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "#666",
            whiteSpace: "pre-wrap",
            backgroundColor: "#f8fafc",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #edf2f7",
            margin: "0 0 15px 0",
          }}
        >
          {selectedItem.description}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #eee",
            paddingTop: "15px",
          }}
        >
          <span
            style={{ fontSize: "22px", fontWeight: "bold", color: "#ff4d4d" }}
          >
            {selectedItem.price.toLocaleString()} 円
          </span>
          <button
            onClick={() => handlePurchaseItem(selectedItem.id)}
            style={{
              padding: "10px 24px",
              backgroundColor: "#ff4d4d",
              color: "white",
              border: "none",
              borderRadius: "25px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            🛍️ 今すぐ購入する
          </button>
        </div>

        {/* 【関連商品提案エリア】 */}
        <div
          style={{
            marginTop: "25px",
            paddingTop: "15px",
            borderTop: "1px solid #eee",
          }}
        >
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: "13px",
              color: "#4f46e5",
              fontWeight: "bold",
            }}
          >
            🧠 こちらの商品を見た人におすすめ (AI Recommendation)
          </h4>

          {isCalculating ? (
            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#666",
                padding: "20px",
              }}
            >
              ⏳ ベクトル空間から関連商品を高速計算中...
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              {relatedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    flex: 1,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
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
                  {item.score !== undefined && (
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#4f46e5",
                        fontFamily: "monospace",
                      }}
                    >
                      Match: {(item.score * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
              {relatedItems.length === 0 && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#aaa",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  関連商品が見つかりませんでした
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetailModal;
