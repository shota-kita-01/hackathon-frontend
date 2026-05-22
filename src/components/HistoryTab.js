import React, { useState, useEffect } from "react";
import HorizontalItemList from "./HorizontalItemList";

function HistoryTab({
  myAppId,
  userLikes,
  handleCardClick,
  handlePurchaseItem,
}) {
  const [viewedItems, setViewedItems] = useState([]);
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  useEffect(() => {
    if (!myAppId) return;
    setIsLoading(true);

    // 📡 3つのエンドポイントから本物のデータを並行して超高速一括ハント
    const pViews = fetch(`${API_URL}/users/${myAppId}/views`).then((res) =>
      res.json(),
    );
    const pKeywords = fetch(`${API_URL}/users/${myAppId}/keywords`).then(
      (res) => res.json(),
    );
    const pAiHome = fetch(`${API_URL}/home/${myAppId}`).then((res) =>
      res.json(),
    );

    Promise.all([pViews, pKeywords, pAiHome])
      .then(([viewsData, keywordsData, homeData]) => {
        // ① 閲覧履歴の格納（重複排除フィルター）
        if (Array.isArray(viewsData)) {
          const uniqueItemsMap = new Map();
          viewsData.forEach((item) => {
            if (item && item.id && !uniqueItemsMap.has(item.id)) {
              uniqueItemsMap.set(item.id, item);
            }
          });
          setViewedItems(Array.from(uniqueItemsMap.values()));
        }

        // ② 本物の検索キーワードの格納（重複を綺麗に抜く数理フィルター）
        if (Array.isArray(keywordsData)) {
          const uniqueWords = Array.from(
            new Set(keywordsData.map((k) => k.keyword)),
          );
          setSearchKeywords(uniqueWords);
        }

        // ③ 4段目：AIによるあなたへの特別推薦（ホームの高度なパーソナライズデータを流用ドッキング！）
        if (
          homeData &&
          homeData.status === "success" &&
          homeData.data?.personalized?.items
        ) {
          setAiRecommendations(homeData.data.personalized.items);
        }
      })
      .catch((err) => console.error("興味・おすすめデータ同期エラー:", err))
      .finally(() => setIsLoading(false));
  }, [myAppId]);

  if (isLoading) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#9ca3af",
          padding: "60px 0",
          fontSize: "14px",
        }}
      >
        ⏳ あなたの興味関心を分析中...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
          margin: "0",
          textAlign: "center",
        }}
      >
        📖 あなたの興味・おすすめ
      </h2>

      {/* 1段目：❤️ いいねした商品 */}
      <div>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "bold",
            color: "#111827",
            margin: "0 0 10px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ❤️ いいねした商品 ({userLikes.length})
        </h3>
        <HorizontalItemList
          items={userLikes}
          handlePurchaseItem={handlePurchaseItem}
          handleCardClick={handleCardClick}
        />
      </div>

      {/* 2段目：👁️ 最近チェックした商品 */}
      <div>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "bold",
            color: "#111827",
            margin: "0 0 10px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          👁️ 最近チェックした商品 ({viewedItems.length})
        </h3>
        <HorizontalItemList
          items={viewedItems}
          handlePurchaseItem={handlePurchaseItem}
          handleCardClick={handleCardClick}
        />
      </div>

      {/* 3段目：🔍 最近の検索キーワード（完全リアルデータ） */}
      <div>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "bold",
            color: "#111827",
            margin: "0 0 12px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🔍 最近の検索キーワード
        </h3>
        {searchKeywords.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              padding: "4px",
            }}
          >
            {searchKeywords.map((query, idx) => (
              <span
                key={idx}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "white",
                  color: "#4b5563",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "500",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                {query}
              </span>
            ))}
          </div>
        ) : (
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
            検索履歴がまだありません。AI検索をお試しください！
          </div>
        )}
      </div>

      {/* 4段目：✨ AIによるあなたへの特別推薦 */}
      <div>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "bold",
            color: "#111827",
            margin: "0 0 10px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ✨ AIが分析したおすすめ商品
        </h3>
        {aiRecommendations.length > 0 ? (
          <HorizontalItemList
            items={aiRecommendations}
            handlePurchaseItem={handlePurchaseItem}
            handleCardClick={handleCardClick}
          />
        ) : (
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
            あなたの好みを学習中... もっとタイムラインを巡ってみましょう！
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryTab;
