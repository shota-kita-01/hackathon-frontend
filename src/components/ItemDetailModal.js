import React, { useState, useEffect } from "react";
import NegotiationSection from "./NegotiationSection";
import DetailRecommendations from "./DetailRecommendations";

function ItemDetailModal({
  selectedItem,
  setSelectedItem,
  handlePurchaseItem,
  myAppId,
  userLikes,
  onLikeToggle,
  onNegotiationSuccess,
}) {
  const [spaceItems, setSpaceItems] = useState([]);
  const [timeItems, setTimeItems] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(false);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

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

    fetch(`${API_URL}/items/${selectedItem.id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    }).catch((err) => console.error("閲覧履歴記録エラー:", err));

    setIsCalculating(true);
    setSpaceItems([]);
    setTimeItems([]);

    fetch(`${API_URL}/recommendations/${selectedItem.asin || selectedItem.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (
            data.carousel_space_similarity &&
            Array.isArray(data.carousel_space_similarity.items)
          ) {
            const filteredSpace = data.carousel_space_similarity.items.filter(
              (item) => item.id !== selectedItem.id,
            );
            setSpaceItems(filteredSpace.slice(0, 3));
          }
          if (
            data.carousel_time_transition &&
            Array.isArray(data.carousel_time_transition.items)
          ) {
            const filteredTime = data.carousel_time_transition.items.filter(
              (item) => item.id !== selectedItem.id,
            );
            setTimeItems(filteredTime.slice(0, 3));
          }
        }
      })
      .catch((err) => console.error("関連商品取得エラー:", err))
      .finally(() => setIsCalculating(false));
  }, [selectedItem, myAppId]);

  const handleLikeClick = () => {
    if (!myAppId || !selectedItem) return;
    setLocalIsLiked(!localIsLiked);

    fetch(`${API_URL}/items/${selectedItem.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") onLikeToggle();
      })
      .catch((err) => {
        console.error("いいね通信エラー:", err);
        setLocalIsLiked((prev) => !prev);
      });
  };

  if (!selectedItem) return null;
  const isSoldOut = selectedItem.status === "sold_out";

  // 💡 出品スタンスが「値下げは考えていない」に指定されている場合は交渉不可とする判定フラグ
  const isNegotiable = selectedItem.seller_stance !== "値下げは考えていない";

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
        {/* ✕ボタン */}
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

        <h2
          style={{ margin: "0 0 15px 0", fontSize: "20px", fontWeight: "bold" }}
        >
          🛍️ 商品詳細
        </h2>

        {/* 商品画像 */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "220px",
            marginBottom: "15px",
          }}
        >
          <img
            src={selectedItem.image_url}
            alt={selectedItem.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12px",
              display: "block",
              opacity: isSoldOut ? 0.4 : 1,
              filter: isSoldOut ? "grayscale(100%)" : "none",
              transition: "all 0.3s ease",
            }}
          />
          {isSoldOut && (
            <div className="sold-ribbon-container-large">
              <span className="sold-ribbon-text-large">SOLD</span>
            </div>
          )}
        </div>

        {/* タイトル & いいね */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: "10px",
            marginBottom: "12px",
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
              flexShrink: 0,
            }}
          >
            {localIsLiked ? "❤️ いいね中" : "🤍 いいね"}
          </button>
        </div>

        {/* タグ */}
        {selectedItem.tags && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <span
              style={{
                backgroundColor: "#e0e7ff",
                color: "#4f46e5",
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              #{selectedItem.tags}
            </span>
          </div>
        )}

        {/* メタデータシート */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#64748b", fontWeight: "600" }}>
              👤 出品者
            </span>
            <span style={{ fontWeight: "700", color: "#334155" }}>
              {selectedItem.seller_name || "公式出品"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "8px",
            }}
          >
            <span style={{ color: "#64748b", fontWeight: "600" }}>
              ✨ 商品の状態
            </span>
            <span style={{ fontWeight: "700", color: "#334155" }}>
              {selectedItem.item_condition || "新品・未使用"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "8px",
            }}
          >
            <span style={{ color: "#64748b", fontWeight: "600" }}>
              🚚 発送日の目安
            </span>
            <span style={{ fontWeight: "700", color: "#334155" }}>
              {selectedItem.shipping_days || "1〜2日で発送"}
            </span>
          </div>
        </div>

        {/* 商品説明 */}
        <p
          style={{
            fontSize: "13px",
            color: "#475569",
            whiteSpace: "pre-wrap",
            backgroundColor: "#ffffff",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            margin: "0 0 15px 0",
            lineHeight: "1.6",
          }}
        >
          {selectedItem.description}
        </p>

        {/* 💰 価格 & 今すぐ購入バー */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #eee",
            paddingTop: "15px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: isSoldOut ? "#94a3b8" : "#ff4d4d",
              textDecoration: isSoldOut ? "line-through" : "none",
            }}
          >
            {selectedItem.price.toLocaleString()} 円
          </span>

          <button
            onClick={() => {
              if (
                window.confirm(
                  `${selectedItem.price.toLocaleString()}円でこの商品を購入しますか？`,
                )
              ) {
                handlePurchaseItem(selectedItem.id);
              }
            }}
            disabled={isSoldOut}
            style={{
              padding: "10px 24px",
              backgroundColor: isSoldOut ? "#cbd5e1" : "#ff4d4d",
              color: isSoldOut ? "#94a3b8" : "white",
              border: "none",
              borderRadius: "25px",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: isSoldOut ? "not-allowed" : "pointer",
              boxShadow: isSoldOut
                ? "none"
                : "0 4px 12px rgba(255, 77, 77, 0.2)",
              transition: "all 0.2s",
            }}
          >
            {isSoldOut ? "❌ 売り切れました" : "🛍️ 今すぐ購入"}
          </button>
        </div>

        {/* 💡 🥊 交渉セクション */}
        {/* 一般出品 ＆ 販売中 ＆ 交渉許可（値下げ考えていない以外）の条件がすべて揃った時のみ、Flexボックスの下にフルサイズで表示 */}
        {selectedItem.id >= 100000 && !isSoldOut && isNegotiable && (
          <NegotiationSection
            itemId={selectedItem.id}
            currentPrice={selectedItem.price}
            myAppId={myAppId}
            onNegotiationSuccess={onNegotiationSuccess}
          />
        )}

        {/* 🧠 2段多次元AI推薦エリア（空間的類似 ＆ マルコフ連鎖時間遷移） */}
        <DetailRecommendations
          isCalculating={isCalculating}
          spaceItems={spaceItems}
          timeItems={timeItems}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </div>
  );
}

export default ItemDetailModal;
