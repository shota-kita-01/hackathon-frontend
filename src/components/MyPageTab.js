import React, { useState, useEffect } from "react";
import ItemList from "./ItemList";

function MyPageTab({
  myAppId,
  handleCardClick,
  handlePurchaseItem,
  loginUser,
}) {
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [viewedItems, setViewedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // 画面が開いた瞬間に、バックエンドから2つの履歴を一気にフェッチする数理モデル
  useEffect(() => {
    if (!myAppId) return;

    setIsLoading(true);

    // 🛍️ 購入履歴の取得
    const p1 = fetch(`${API_URL}/users/${myAppId}/purchases`).then((res) =>
      res.json(),
    );
    // 👁️ 閲覧履歴の取得
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
        ⏳ あなたのアクティビティを読み込み中...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* 👤 ユーザープロフィールカード */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "25px",
            backgroundColor: "#ff4d4d",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          {loginUser?.email[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px", color: "#333" }}>
            {loginUser?.email.split("@")[0]}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            会員ID: 0000{myAppId}
          </div>
        </div>
      </div>

      {/* 🛍️ 購入履歴セクション */}
      <div>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#111827",
            margin: "0 0 15px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🛍️ 購入した商品 ({purchasedItems.length})
        </h3>
        {purchasedItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "25px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px dashed #d1d5db",
              fontSize: "13px",
            }}
          >
            まだ購入した商品はありません。
          </div>
        ) : (
          <div onClick={(e) => handleCardClick(e, purchasedItems)}>
            <ItemList
              items={purchasedItems}
              handlePurchaseItem={handlePurchaseItem}
            />
          </div>
        )}
      </div>

      {/* 👁️ 閲覧履歴セクション */}
      <div>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#111827",
            margin: "0 0 15px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          👁️ 最近チェックした商品 ({viewedItems.length})
        </h3>
        {viewedItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "25px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px dashed #d1d5db",
              fontSize: "13px",
            }}
          >
            最近チェックした商品はここに表示されます。
          </div>
        ) : (
          <div onClick={(e) => handleCardClick(e, viewedItems)}>
            <ItemList
              items={viewedItems}
              handlePurchaseItem={handlePurchaseItem}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPageTab;
