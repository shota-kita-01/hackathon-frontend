import React from "react";

function MyPageTab({ myAppId, loginUser }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
          {loginUser?.email[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
            {loginUser?.email.split("@")[0]}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
            会員ID: 0000{myAppId}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "30px",
          textAlign: "center",
          color: "#9ca3af",
          backgroundColor: "white",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          fontSize: "14px",
        }}
      >
        ⚙️ アカウント設定メニューは現在準備中です。
      </div>
    </div>
  );
}

export default MyPageTab;
