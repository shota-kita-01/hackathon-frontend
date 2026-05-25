import React from "react";

function Header({ loginUser, handleLogout, setCurrentTab, myAppId }) {
  // 👥 ブラウザの永続ストレージからログイン履歴のある本物のアカウント達をロード
  const savedAccounts = JSON.parse(
    localStorage.getItem("fleamarket_authenticated_accounts") || "[]",
  );

  // 💡 現在アクティブな会員ID（myAppId）に合致するアカウントのメールアドレスを動的ハント
  const currentActiveAccount = savedAccounts.find(
    (acc) => acc.id === myAppId,
  ) || {
    email: loginUser?.email || "ゲストユーザー",
  };

  return (
    <header
      style={{
        backgroundColor: "white",
        // 💡 影は2段目のNavigationの下に持っていくため、ここでは一旦クリア
        borderBottom: "1px solid #f3f4f6",
        padding: "0 20px",
        height: "60px", // 💡 高さを60pxに完全固定
        position: "sticky",
        top: 0,
        zIndex: 101, // 💡 2段目のNavigation(100)より前面に保証
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "#ff4d4d",
          margin: 0,
          fontSize: "22px", // 60pxの高さに最適化
          fontWeight: "bold",
          letterSpacing: "1px",
          cursor: "pointer",
        }}
        onClick={() => setCurrentTab("home")}
      >
        次世代型フリマアプリ
      </h1>
      {loginUser && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            fontSize: "14px",
            color: "#333",
          }}
        >
          {/* 💡 Firebaseの生セッションではなく、現在アクティブなユーザーのメアドを追従表示 */}
          <span style={{ fontWeight: "500" }}>
            👤 {currentActiveAccount.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              backgroundColor: "#f5f6f8",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
