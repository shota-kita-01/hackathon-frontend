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

  // 💡 いいねの「即時反応」を実現するためのローカルステート
  const [localIsLiked, setLocalIsLiked] = useState(false);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // モーダルが開かれたら、親から渡されたいいねリストをもとに初期状態をセット
  useEffect(() => {
    if (selectedItem) {
      const isLikedInitially = userLikes.some(
        (like) => like.id === selectedItem.id,
      );
      setLocalIsLiked(isLikedInitially);
    }
  }, [selectedItem, userLikes]);

  useEffect(() => {
    if (!selectedItem || !myAppId) return;

    // 🚀 ① 閲覧履歴API
    fetch(`${API_URL}/items/${selectedItem.id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    }).catch((err) => console.error("閲覧履歴記録エラー:", err));

    // 🧠 ② 関連商品AI推薦
    setIsCalculating(true);
    setRelatedItems([]);

    fetch(`${API_URL}/recommendations/${selectedItem.asin}`)
      .then((res) => res.json())
      .then((data) => {
        if (
          data &&
          data.carousel_space_similarity &&
          Array.isArray(data.carousel_space_similarity.items)
        ) {
          const filtered = data.carousel_space_similarity.items.filter(
            (item) => item.id !== selectedItem.id,
          );
          setRelatedItems(filtered.slice(0, 3));
        }
      })
      .catch((err) => console.error("関連商品取得エラー:", err))
      .finally(() => setIsCalculating(false));
  }, [selectedItem, myAppId]);

  // 🆕 いいねボタンが押された時の処理
  const handleLikeClick = () => {
    if (!myAppId || !selectedItem) return;

    // 💡 ユーザーのクリックに対して「即時」に色を変える！（UX向上）
    setLocalIsLiked(!localIsLiked);

    fetch(`${API_URL}/items/${selectedItem.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          onLikeToggle(); // 裏側で親のリストも最新にする
        }
      })
      .catch((err) => {
        console.error("いいね通信エラー:", err);
        // 万が一エラーなら色を元に戻す
        setLocalIsLiked((prev) => !prev);
      });
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
          position: "relative", // 💡 ここが Relative だから、絶対配置の基準になる
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* 🆕 ばつ印を右上に絶対配置！ */}
        <button
          onClick={() => setSelectedItem(null)}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            border: "none",
            backgroundColor: "#f3f4f6",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "16px",
            cursor: "pointer",
            color: "#6b7280",
            transition: "background-color 0.2s",
          }}
        >
          ✕
        </button>

        {/* ヘッダーの余白調整 */}
        <h2
          style={{ margin: "0 0 15px 0", fontSize: "20px", fontWeight: "bold" }}
        >
          🛍️ 商品詳細
        </h2>

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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <h3
            style={{ margin: 0, fontSize: "18px", flex: 1, lineHeight: "1.4" }}
          >
            {selectedItem.name}
          </h3>
          <button
            onClick={handleLikeClick}
            style={{
              // 💡 localIsLiked（即時反応ステート）を使って色を制御
              backgroundColor: localIsLiked ? "#fff1f2" : "#f3f4f6",
              color: localIsLiked ? "#f43f5e" : "#9ca3af",
              border: localIsLiked ? "1px solid #fecdd3" : "1px solid #e5e7eb",
              borderRadius: "30px",
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s",
              flexShrink: 0, // タイトルが長くてもボタンが潰れないようにする
            }}
          >
            {localIsLiked ? "❤️ いいね中" : "🤍 いいね"}
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
              transition: "transform 0.1s",
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
            🧠 この商品を見た人におすすめ (AI 空間的類似推薦)
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
