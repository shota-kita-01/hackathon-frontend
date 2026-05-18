import React from "react";

function Navigation({ myAppId, currentTab, setCurrentTab }) {
  if (!myAppId) return null;

  return (
    <div
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <button
        onClick={() => setCurrentTab("home")}
        style={{
          padding: "14px 15px",
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
        onClick={() => setCurrentTab("likes")}
        style={{
          padding: "14px 15px",
          backgroundColor: "transparent",
          border: "none",
          borderBottom:
            currentTab === "likes"
              ? "3px solid #ff4d4d"
              : "3px solid transparent",
          color: currentTab === "likes" ? "#ff4d4d" : "#666",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        ❤️ いいね一覧
      </button>
      <button
        onClick={() => setCurrentTab("sell")}
        style={{
          padding: "14px 15px",
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
        📸 出品する
      </button>
    </div>
  );
}

export default Navigation;
