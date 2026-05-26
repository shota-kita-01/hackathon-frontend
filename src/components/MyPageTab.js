import React, { useState, useEffect } from "react";
import HorizontalItemList from "./HorizontalItemList";

function MyPageTab({
  myAppId,
  loginUser,
  handleCardClick,
  handlePurchaseItem,
  setMyAppId,
  handleLogout,
  setActiveTransactionId,
  setCurrentTab,
}) {
  const [purchasedItems, setPurchasedItems] = useState([]); // 購入履歴
  const [myProducts, setMyProducts] = useState([]); // 出品履歴
  const [activeTransactions, setActiveTransactions] = useState([]); // 進行中の取引
  const [completedTransactions, setCompletedTransactions] = useState([]); // 完了済みの過去取引
  const [isLoading, setIsLoading] = useState(true);

  // 👥 ブラウザの永続ストレージからロード
  const [accountList, setAccountList] = useState(() => {
    const saved = localStorage.getItem("fleamarket_authenticated_accounts");
    return saved ? JSON.parse(saved) : [];
  });

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // 🔄 仕組み1: アカウントの自動蓄積・同期
  useEffect(() => {
    if (!myAppId || !loginUser?.email) return;

    const currentAccount = {
      id: myAppId,
      name: loginUser.email.split("@")[0],
      email: loginUser.email,
    };

    setAccountList((prevList) => {
      if (prevList.some((acc) => String(acc.id) === String(myAppId)))
        return prevList;
      const updatedList = [...prevList, currentAccount];
      localStorage.setItem(
        "fleamarket_authenticated_accounts",
        JSON.stringify(updatedList),
      );
      return updatedList;
    });
  }, [myAppId, loginUser]);

  // 🛒 仕組み2: 4本のAPIを一斉に並列高速フェッチ ＆ 3秒自動同期
  useEffect(() => {
    if (!myAppId) return;
    setIsLoading(true);

    const fetchMyPageData = () => {
      const p1 = fetch(`${API_URL}/users/${myAppId}/purchases`).then((res) =>
        res.json(),
      );
      const p2 = fetch(`${API_URL}/users/${myAppId}/products`).then((res) =>
        res.json(),
      );
      const p3 = fetch(`${API_URL}/users/${myAppId}/transactions`).then((res) =>
        res.json(),
      );
      const p4 = fetch(
        `${API_URL}/users/${myAppId}/transactions/completed`,
      ).then((res) => res.json());

      Promise.all([p1, p2, p3, p4])
        .then(([purchasesData, productsData, txData, completedTxData]) => {
          if (Array.isArray(purchasesData)) setPurchasedItems(purchasesData);
          if (Array.isArray(productsData)) setMyProducts(productsData);
          if (Array.isArray(txData)) setActiveTransactions(txData);
          if (Array.isArray(completedTxData))
            setCompletedTransactions(completedTxData);
        })
        .catch((err) => console.error("マイページデータ取得エラー:", err))
        .finally(() => setIsLoading(false));
    };

    fetchMyPageData();
    const timer = setInterval(fetchMyPageData, 3000);
    return () => clearInterval(timer);
  }, [myAppId]);

  const handleAddAccount = () => {
    if (
      window.confirm(
        "別のアカウントを追加するために、一時的にサインイン画面へ遷移します。よろしいですか？",
      )
    ) {
      handleLogout();
    }
  };

  const handleRemoveAccountFromCache = (e, targetId) => {
    e.stopPropagation();
    if (!window.confirm("このアカウントのログイン情報を削除しますか？")) return;

    const updatedList = accountList.filter((acc) => acc.id !== targetId);
    setAccountList(updatedList);
    localStorage.setItem(
      "fleamarket_authenticated_accounts",
      JSON.stringify(updatedList),
    );

    if (String(myAppId) === String(targetId)) {
      handleLogout();
    }
  };

  const currentActiveAccount = accountList.find(
    (acc) => String(acc.id) === String(myAppId),
  ) || {
    name: loginUser?.email ? loginUser.email.split("@")[0] : "ゲストユーザー",
    email: loginUser?.email || "",
  };

  const handleJumpToTransaction = (txId) => {
    setActiveTransactionId(txId);
    setCurrentTab("transaction");
    window.scrollTo(0, 0);
  };

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

      {/* ❶ プロフィールカード */}
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
          {currentActiveAccount.email
            ? currentActiveAccount.email[0].toUpperCase()
            : "U"}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
            {currentActiveAccount.name}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
            会員ID: 0000{myAppId}
          </div>
        </div>
      </div>

      {/* 🚚 ❷ 【最優先】進行中の取引レーン（取引中は常に一番上に出現！） */}
      {activeTransactions.length > 0 && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{ fontSize: "14px", fontWeight: "bold", color: "#d97706" }}
          >
            🚚 進行中の取引（発送・メッセージ手続き）
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {activeTransactions.map((tx) => (
              <div
                key={tx.transaction_id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #fef3c7",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <img
                  src={tx.item_image_url}
                  alt=""
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "6px",
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    {tx.item_name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9a3412",
                      marginTop: "2px",
                    }}
                  >
                    状態:{" "}
                    {tx.transaction_status === "shipping_pending"
                      ? "⏳ 発送待ち"
                      : "🚚 発送済み・受取評価待ち"}
                    {String(myAppId) === String(tx.seller_id)
                      ? " (出品者)"
                      : " (購入者)"}
                  </div>
                </div>
                <button
                  onClick={() => handleJumpToTransaction(tx.transaction_id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#d97706",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  取引画面へ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 👥 ❸ アカウント切り替えマルチセンター */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "900",
            color: "#4f46e5",
            letterSpacing: "0.5px",
          }}
        >
          👥 アカウントの切り替え
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {accountList.map((acc) => {
            const isCurrent = String(acc.id) === String(myAppId);
            return (
              <div
                key={acc.id}
                style={{
                  backgroundColor: isCurrent ? "#eff6ff" : "white",
                  border: isCurrent ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#1e293b",
                      }}
                    >
                      {acc.name}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          backgroundColor: "#3b82f6",
                          color: "white",
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        現在アクティブ
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    ID: 0000{acc.id} • {acc.email}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {!isCurrent ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => setMyAppId(acc.id)}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        切り替える
                      </button>
                      <button
                        onClick={(e) => handleRemoveAccountFromCache(e, acc.id)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "transparent",
                          color: "#94a3b8",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "white",
                        color: "#ef4444",
                        border: "1px solid #fca5a5",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      完全にログアウト
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={handleAddAccount}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "white",
            color: "#4f46e5",
            border: "2px dashed #c7d2fe",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          ＋ 別のアカウントで新規ログイン（リストに追加）
        </button>
      </div>

      {/* 🛍️ ❹ 通常の商品履歴レーン（購入した商品・出品した商品の一覧） */}
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

      {/* 🏁 ❺ 【最下部へ移動完了】過去の取引履歴アーカイブ */}
      {completedTransactions.length > 0 && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{ fontSize: "14px", fontWeight: "bold", color: "#475569" }}
          >
            🏁 過去の取引履歴（完了済みのメッセージ・詳細確認）
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {completedTransactions.map((tx) => (
              <div
                key={tx.transaction_id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <img
                  src={tx.item_image_url}
                  alt=""
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "6px",
                    objectFit: "cover",
                    filter: "grayscale(30%)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    {tx.item_name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    ✅ 取引完了{" "}
                    {String(myAppId) === String(tx.seller_id)
                      ? " (元出品者)"
                      : " (元購入者)"}
                  </div>
                </div>
                <button
                  onClick={() => handleJumpToTransaction(tx.transaction_id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#64748b",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ログを見る
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPageTab;
