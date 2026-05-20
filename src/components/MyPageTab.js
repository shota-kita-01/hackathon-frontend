import React, { useState, useEffect } from "react";
import HorizontalItemList from "./HorizontalItemList";

function MyPageTab({
  myAppId,
  loginUser,
  handleCardClick,
  handlePurchaseItem,
}) {
  const [purchasedItems, setPurchasedItems] = useState([]); // 購入履歴
  const [myProducts, setMyProducts] = useState([]); // 出品履歴
  const [isLoading, setIsLoading] = useState(true);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // マイページ表示時に「購入履歴」と「出品履歴」を同時に取得
  useEffect(() => {
    if (!myAppId) return;
    setIsLoading(true);

    const p1 = fetch(`${API_URL}/users/${myAppId}/purchases`).then((res) =>
      res.json(),
    );
    const p2 = fetch(`${API_URL}/users/${myAppId}/products`).then((res) =>
      res.json(),
    );

    Promise.all([p1, p2])
      .then(([purchasesData, productsData]) => {
        if (Array.isArray(purchasesData)) setPurchasedItems(purchasesData);
        if (Array.isArray(productsData)) setMyProducts(productsData);
      })
      .catch((err) => console.error("マイページデータ取得エラー:", err))
      .finally(() => setIsLoading(false));
  }, [myAppId]);

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
        👤 マイページ
      </h2>

      {/* ユーザープロフィールカード */}
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
            width: "60px",
            height: "60px",
            borderRadius: "30px",
            backgroundColor: "#ff4d4d",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {loginUser?.email ? loginUser.email[0].toUpperCase() : "U"}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
            {loginUser?.email
              ? loginUser.email.split("@")[0]
              : "ゲストユーザー"}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
            会員ID: 0000{myAppId}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            textAlign: "center",
            color: "#9ca3af",
            padding: "40px 0",
            fontSize: "14px",
          }}
        >
          ⏳ 取引履歴を読み込み中...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* 1段目：🛍️ 購入した商品 */}
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
            <HorizontalItemList
              items={purchasedItems}
              handlePurchaseItem={handlePurchaseItem}
              handleCardClick={handleCardClick}
            />
          </div>

          {/* 2段目：📸 出品した商品 */}
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
              📸 出品した商品 ({myProducts.length})
            </h3>
            <HorizontalItemList
              items={myProducts}
              handlePurchaseItem={handlePurchaseItem}
              handleCardClick={handleCardClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPageTab;
