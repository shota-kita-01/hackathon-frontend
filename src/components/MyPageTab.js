import React, { useState, useEffect } from "react";
import HorizontalItemList from "./HorizontalItemList";

function MyPageTab({
  myAppId,
  loginUser,
  handleCardClick,
  handlePurchaseItem,
  setMyAppId, // 親（App.js）の状態を書き換える
  handleLogout, // 親（App.js）のログアウト処理
}) {
  const [purchasedItems, setPurchasedItems] = useState([]); // 購入履歴
  const [myProducts, setMyProducts] = useState([]); // 出品履歴
  const [isLoading, setIsLoading] = useState(true);

  // 👥 ブラウザの永続ストレージ（localStorage）から過去にログインした本物のアカウント達をロード
  const [accountList, setAccountList] = useState(() => {
    const saved = localStorage.getItem("fleamarket_authenticated_accounts");
    return saved ? JSON.parse(saved) : [];
  });

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // 🔄 仕組み1: 現在ログインに成功しているアカウントを、自動的にマルチアカウントリストへ蓄積・同期する数理ロジック
  useEffect(() => {
    if (!myAppId || !loginUser?.email) return;

    const currentAccount = {
      id: myAppId,
      name: loginUser.email.split("@")[0], // メアドの@より前を表示名にする
      email: loginUser.email,
    };

    setAccountList((prevList) => {
      // 既にリストに同じ会員IDがあれば重複して追加しないガード
      if (prevList.some((acc) => acc.id === myAppId)) return prevList;

      const updatedList = [...prevList, currentAccount];
      localStorage.setItem(
        "fleamarket_authenticated_accounts",
        JSON.stringify(updatedList),
      );
      return updatedList;
    });
  }, [myAppId, loginUser]);

  // 🛒 仕組み2: 選択されたアクティブユーザーの取引履歴をリアルタイムフェッチ
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

  // ➕ 既存のログイン導線を100%活かした「アカウントの正規追加」
  const handleAddAccount = () => {
    if (
      window.confirm(
        "別のアカウントを追加するために、一時的にサインイン画面へ遷移します。よろしいですか？\n（現在のアカウントは自動的に記憶され、いつでも戻ってこられます）",
      )
    ) {
      // 親のログアウト関数を呼び出し、Firebase Authのセッションを安全に切断してLoginFormを表示させる
      handleLogout();
    }
  };

  // ❌ 記憶している特定のデモアカウントをブラウザから忘却（削除）する機能
  const handleRemoveAccountFromCache = (e, targetId) => {
    e.stopPropagation(); // 切り替えイベントの暴発を差し止めるガード
    if (
      !window.confirm(
        "このアカウントのログイン情報を削除しますか？\n（ログイン情報を再び入力すればまた戻ってくることができます）",
      )
    )
      return;

    const updatedList = accountList.filter((acc) => acc.id !== targetId);
    setAccountList(updatedList);
    localStorage.setItem(
      "fleamarket_authenticated_accounts",
      JSON.stringify(updatedList),
    );

    // もし今ログイン中のアカウントを削除した場合は、強制的にログアウトさせる
    if (myAppId === targetId) {
      handleLogout();
    }
  };

  // 💡 【数理同期ハック】選択されている myAppId に合致するアカウント情報をリストから動的抽出
  const currentActiveAccount = accountList.find(
    (acc) => acc.id === myAppId,
  ) || {
    name: loginUser?.email ? loginUser.email.split("@")[0] : "ゲストユーザー",
    email: loginUser?.email || "",
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

      {/* ❶ メインのユーザープロフィールカード */}
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
          {/* 💡 Firebaseの生セッションではなく、現在のアクティブアカウントのメアド頭文字を追従表示 */}
          {currentActiveAccount.email
            ? currentActiveAccount.email[0].toUpperCase()
            : "U"}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
            {/* 💡 現在のアクティブアカウントの表示名を完全リアルタイム同期 */}
            {currentActiveAccount.name}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
            会員ID: 0000{myAppId}
          </div>
        </div>
      </div>

      {/* ❷ 👥 【プロダクト仕様】永続化マルチアカウントスイッチングセンター */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)",
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
          👥 アカウントの切り替え（このブラウザでログイン履歴のあるユーザー）
        </div>

        {/* アカウントの縦並びリスト */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {accountList.map((acc) => {
            const isCurrent = acc.id === myAppId;
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
                  transition: "all 0.2s",
                }}
              >
                {/* 左側：アカウント基本情報 */}
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

                {/* 右側：インライン・アクションボタン */}
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
                          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
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
                        title="記憶を削除"
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

        {/* 下段：本物のアカウント追加フローのトリガー */}
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
            transition: "all 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#f5f3ff")
          }
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
        >
          ＋ 別のアカウントで新規ログイン（リストに追加）
        </button>
      </div>

      {/* ❸ 取引履歴（購入・出品）レーン */}
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
