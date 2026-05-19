import React, { useState, useEffect } from "react";
import HorizontalItemList from "./HorizontalItemList";

function HistoryTab({
  myAppId,
  userLikes,
  handleCardClick,
  handlePurchaseItem,
}) {
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [viewedItems, setViewedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // タブが開かれた瞬間に購入履歴と閲覧履歴を取得
  useEffect(() => {
    if (!myAppId) return;
    setIsLoading(true);

    const p1 = fetch(`${API_URL}/users/${myAppId}/purchases`).then((res) =>
      res.json(),
    );
    const p2 = fetch(`${API_URL}/users/${myAppId}/views`).then((res) =>
      res.json(),
    );

    Promise.all([p1, p2])
      .then(([purchasesData, viewsData]) => {
        if (Array.isArray(purchasesData)) setPurchasedItems(purchasesData);
        if (Array.isArray(viewsData)) setViewedItems(viewsData);
      })
      .catch((err) => console.error("履歴データ取得エラー:", err))
      .finally(() => setIsLoading(false));
  }, [myAppId]);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", color: "#666", padding: "40px" }}>
        ⏳ 履歴データを読み込み中...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
          margin: "0",
        }}
      >
        📖 あなたの履歴
      </h2>

      {/* 1段目：購入した商品 */}
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
          🛍️ 購入した商品 ({purchasedItems.length})
        </h3>
        <div onClick={(e) => handleCardClick(e, purchasedItems)}>
          <HorizontalItemList
            items={purchasedItems}
            handlePurchaseItem={handlePurchaseItem}
          />
        </div>
      </div>

      {/* 2段目：いいねした商品（App.jsから渡されたuserLikesを使用） */}
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
        <div onClick={(e) => handleCardClick(e, userLikes)}>
          <HorizontalItemList
            items={userLikes}
            handlePurchaseItem={handlePurchaseItem}
          />
        </div>
      </div>

      {/* 3段目：最近チェックした商品 */}
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
        <div onClick={(e) => handleCardClick(e, viewedItems)}>
          <HorizontalItemList
            items={viewedItems}
            handlePurchaseItem={handlePurchaseItem}
          />
        </div>
      </div>
    </div>
  );
}

export default HistoryTab;
