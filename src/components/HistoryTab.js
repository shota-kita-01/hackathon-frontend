import React, { useState, useEffect } from "react";
import HorizontalItemList from "./HorizontalItemList";

function HistoryTab({
  myAppId,
  userLikes,
  handleCardClick,
  handlePurchaseItem,
}) {
  const [viewedItems, setViewedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // タブが開かれた瞬間に閲覧履歴のみを取得（購入履歴はマイページへ移行したため削除）
  useEffect(() => {
    if (!myAppId) return;
    setIsLoading(true);

    fetch(`${API_URL}/users/${myAppId}/views`)
      .then((res) => res.json())
      .then((viewsData) => {
        if (Array.isArray(viewsData)) setViewedItems(viewsData);
      })
      .catch((err) => console.error("履歴データ取得エラー:", err))
      .finally(() => setIsLoading(false));
  }, [myAppId]);

  // 🆕 デモ用の検索履歴データ（後ほどバックエンドと繋ぐためのモック）
  const mockSearchQueries = [
    "Nike sneakers",
    "Chanel bag",
    "vintage wallet",
    "gold ring",
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", color: "#666", padding: "40px" }}>
        ⏳ 履歴データを読み込み中...
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

      {/* 1段目：❤️ いいねした商品（App.jsから渡されたuserLikesを使用） */}
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

      {/* 3段目：🆕 🔍 最近の検索履歴（チップ風のオシャレなUI） */}
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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            padding: "4px",
          }}
        >
          {mockSearchQueries.map((query, idx) => (
            <span
              key={idx}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f3f4f6",
                color: "#4b5563",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "500",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              className="search-history-chip"
            >
              {query}
            </span>
          ))}
        </div>
      </div>

      {/* 4段目：🆕 ✨ AIによるあなたへの特別推薦（今後の拡張枠） */}
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
        {/* 現状は閲覧履歴をベースに「AIがこれに注目しています」感を出すデモ表示 */}
        {viewedItems.length > 0 ? (
          <HorizontalItemList
            items={[...viewedItems].reverse().slice(0, 5)} // 閲覧履歴の逆順などを一旦流す
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
            好みを分析中... もっと商品をチェックしてみましょう！
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryTab;
