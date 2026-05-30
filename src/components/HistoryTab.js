import React, { useState, useEffect } from "react";
import HorizontalItemList from "./HorizontalItemList";
// 💡 履歴・おすすめ画面の各セクションを記号化する精鋭アイコンたちをインポート
import { History, Heart, Eye, Search, Sparkles, Loader2 } from "lucide-react";

function HistoryTab({
  myAppId,
  userLikes,
  handleCardClick,
  handlePurchaseItem,
  onKeywordClick,
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

    // 3つのエンドポイントから本物のデータを並行して一括ハント
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

        // ② 本物の検索キーワードの格納
        if (Array.isArray(keywordsData)) {
          const uniqueWords = Array.from(
            new Set(keywordsData.map((k) => k.keyword)),
          );
          setSearchKeywords(uniqueWords);
        }

        // ③ 4段目：AIによるあなたへの特別推薦
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

  // ⏳ ローディング画面の超スタイリッシュ化
  if (isLoading) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#9ca3af",
          padding: "60px 0",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <Loader2 size={16} className="animate-spin" />{" "}
        {/* 💡 ⏳を回転するインジケーターへリプレイス */}
        <span>あなたの興味関心を分析中...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
      {/* 📖 メインタイトルのスマート化 */}
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
          margin: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <History size={20} color="#333" />
        <span>あなたの興味・おすすめ</span>
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
          <Heart size={16} color="#ff4d4d" fill="#ff4d4d" />{" "}
          {/* 💡 赤いフィルのハートでパッと見やすく */}
          <span>いいねした商品 ({userLikes.length})</span>
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
          <Eye size={16} color="#111827" />{" "}
          {/* 💡 👁️をシャープなEyeアイコンへ */}
          <span>最近チェックした商品 ({viewedItems.length})</span>
        </h3>
        <HorizontalItemList
          items={viewedItems}
          handlePurchaseItem={handlePurchaseItem}
          handleCardClick={handleCardClick}
        />
      </div>

      {/* 3段目：🔍 最近の検索キーワード */}
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
          <Search size={16} color="#111827" />{" "}
          {/* 💡 🔍を一貫性のある虫眼鏡アイコンへ */}
          <span>最近の検索キーワード</span>
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
                onClick={() => onKeywordClick && onKeywordClick(query)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "white",
                  color: "#4b5563",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "500",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "translateY(0)";
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
          <Sparkles size={16} color="#4f46e5" />{" "}
          {/* 💡 ✨をインテリジェントなパープルスパークルへ */}
          <span>AIが分析したおすすめ商品</span>
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
