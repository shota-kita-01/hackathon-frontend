import React from "react";

function Header({ loginUser, handleLogout, setCurrentTab }) {
  return (
    <header
      style={{
        backgroundColor: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        padding: "15px 20px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "#ff4d4d",
          margin: 0,
          fontSize: "24px",
          fontWeight: "bold",
          letterSpacing: "1px",
          cursor: "pointer",
        }}
        onClick={() => setCurrentTab("home")}
      >
        フリマアプリ
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
          <span style={{ fontWeight: "500" }}>👤 {loginUser.email}</span>
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
