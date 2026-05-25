import React from "react";

function Navigation({ myAppId, currentTab, setCurrentTab }) {
  if (!myAppId) return null;

  return (
    <div
      style={{
        backgroundColor: "white",
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        position: "sticky", // 💡 ナびゲーションも固定化
        top: "60px", // 💡 Header(60px)の真下にピタッと吸着させる数理設計
        zIndex: 100, // 💡 コンテンツより上で、Headerより下のレイヤー
        // 💡 スクロールした時に、アプリ全体が下に潜り込んで浮き出て見えるシャドウ効果
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <button
        onClick={() => setCurrentTab("home")}
        style={{
          padding: "14px 10px",
          backgroundColor: "transparent",
          border: "none",
          borderBottom:
            currentTab === "home"
              ? "3px solid #ff4d4d"
              : "3px solid transparent",
          color: currentTab === "home" ? "#ff4d4d" : "#666",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        🏠 ホーム
      </button>
      <button
        onClick={() => setCurrentTab("search")}
        style={{
          padding: "14px 10px",
          backgroundColor: "transparent",
          border: "none",
          borderBottom:
            currentTab === "search"
              ? "3px solid #ff4d4d"
              : "3px solid transparent",
          color: currentTab === "search" ? "#ff4d4d" : "#666",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        🔍 検索
      </button>

      <button
        onClick={() => setCurrentTab("history")}
        style={{
          padding: "14px 10px",
          backgroundColor: "transparent",
          border: "none",
          borderBottom:
            currentTab === "history"
              ? "3px solid #ff4d4d"
              : "3px solid transparent",
          color: currentTab === "history" ? "#ff4d4d" : "#666",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        ✨ おすすめ・履歴
      </button>

      <button
        onClick={() => setCurrentTab("mypage")}
        style={{
          padding: "14px 10px",
          backgroundColor: "transparent",
          border: "none",
          borderBottom:
            currentTab === "mypage"
              ? "3px solid #ff4d4d"
              : "3px solid transparent",
          color: currentTab === "mypage" ? "#ff4d4d" : "#666",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        👤 マイページ
      </button>
      <button
        onClick={() => setCurrentTab("sell")}
        style={{
          padding: "14px 10px",
          backgroundColor: "transparent",
          border: "none",
          borderBottom:
            currentTab === "sell"
              ? "3px solid #ff4d4d"
              : "3px solid transparent",
          color: currentTab === "sell" ? "#ff4d4d" : "#666",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        📸 出品
      </button>
    </div>
  );
}

export default Navigation;
