import React, { useState, useEffect } from "react";

function ItemDetailModal({
  selectedItem,
  setSelectedItem,
  handlePurchaseItem,
  myAppId,
  userLikes,
  onLikeToggle,
}) {
  // 💡 2つの異なるAI推薦を格納するためにStateを分離
  const [spaceItems, setSpaceItems] = useState([]); // 1. 空間的類似
  const [timeItems, setTimeItems] = useState([]); // 2. 確率的時間遷移
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

    // 🧠 ② 関連商品AI推薦（ハイブリッド2段ハント）
    setIsCalculating(true);
    setSpaceItems([]);
    setTimeItems([]);

    fetch(`${API_URL}/recommendations/${selectedItem.asin || selectedItem.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          // 📊 抽出1: 同じカテゴリーから、意味（隠れ表現）が近いもの上位3つ
          if (
            data.carousel_space_similarity &&
            Array.isArray(data.carousel_space_similarity.items)
          ) {
            const filteredSpace = data.carousel_space_similarity.items.filter(
              (item) => item.id !== selectedItem.id,
            );
            setSpaceItems(filteredSpace.slice(0, 3));
          }

          // 📊 抽出2: マルコフ遷移した未来のカテゴリーから、近いもの上位3つ
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

  // いいねボタンが押された時の処理
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
        if (data.status === "success") {
          onLikeToggle();
        }
      })
      .catch((err) => {
        console.error("いいね通信エラー:", err);
        setLocalIsLiked((prev) => !prev);
      });
  };

  if (!selectedItem) return null;

  // 💡 売り切れフラグ
  const isSoldOut = selectedItem.status === "sold_out";

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

        {/* 💡 【修正】画像スタイルとエフェクトを HorizontalItemList と100%同期！ */}
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
              opacity: isSoldOut ? 0.4 : 1, // ✨ 売り切れなら一律で 0.4 まで薄くする
              filter: isSoldOut ? "grayscale(100%)" : "none", // ✨ 売り切れなら完全グレースケール（白黒）化
              transition: "all 0.3s ease",
            }}
          />
          {/* ❌ 特大影付き斜めリボン（sold-ribbon-container-large） */}
          {isSoldOut && (
            <div className="sold-ribbon-container-large">
              <span className="sold-ribbon-text-large">SOLD</span>
            </div>
          )}
        </div>

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

        {/* カテゴリーハッシュタグ */}
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

        {/* 商品詳細メタデータシート */}
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

        {/* 商品説明文 */}
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

        {/* 価格 ＆ 購入セクション */}
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
            onClick={() => handlePurchaseItem(selectedItem.id)}
            disabled={isSoldOut}
            style={{
              padding: "10px 24px",
              backgroundColor: isSoldOut ? "#cbd5e1" : "#ff4d4d",
              color: isSoldOut ? "#94a3b8" : "white",
              border: "none",
              borderRadius: "25px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: isSoldOut ? "not-allowed" : "pointer",
              boxShadow: isSoldOut
                ? "none"
                : "0 4px 12px rgba(255, 77, 77, 0.2)",
              transition: "all 0.2s",
            }}
          >
            {isSoldOut ? "❌ 売り切れました" : "🛍️ 今すぐ購入する"}
          </button>
        </div>

        {/* ===================================================
            🔥 【ハイブリッド多次元AI推薦エリア（2段構成）】
           =================================================== */}
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
          {/* 🥇 1段目：同じカテゴリーの空間類似推薦 */}
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

          {/* 🥈 2段目：マルコフ連鎖による時間遷移推薦 */}
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
      </div>
    </div>
  );
}

export default ItemDetailModal;
