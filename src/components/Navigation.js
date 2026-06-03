import React from "react";
import { Home, Search, Sparkles, Camera, User } from "lucide-react";

function Navigation({ myAppId, currentTab, setCurrentTab }) {
  if (!myAppId) return null;

  return (
    <div
      className="nav-bar-container"
      style={{
        backgroundColor: "white",
        display: "flex",
        justifyContent: "center",
        gap: "12px", // 基準値（大画面PC用）
        position: "sticky",
        top: "60px",
        zIndex: 100,
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* 段階的に少しずつサイズを落とし、中画面での不用意な縮みすぎを完璧に阻止する */}
      <style>{`
        @media (max-width: 640px) {
          .nav-bar-container { gap: 4px !important; }
          .nav-tab-button { 
            padding: 14px 6px !important; 
            font-size: 13.5px !important;
            gap: 8px !important; 
          }
          .nav-tab-button svg { width: 15px !important; height: 15px !important; }
        }

        @media (max-width: 480px) {
          .nav-bar-container { gap: 1px !important; }
          .nav-tab-button { 
            padding: 14px 4px !important; 
            font-size: 11px !important; 
            gap: 3px !important; 
          }
          .nav-tab-button svg { width: 14px !important; height: 14px !important; }
        }

        .nav-tab-button { white-space: nowrap !important; }
      `}</style>

      {/* ホーム */}
      <button
        onClick={() => setCurrentTab("home")}
        className="nav-tab-button"
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
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
        }}
      >
        <Home size={16} />
        <span>ホーム</span>
      </button>

      {/* 検索 */}
      <button
        onClick={() => setCurrentTab("search")}
        className="nav-tab-button"
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
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
        }}
      >
        <Search size={16} />
        <span>検索</span>
      </button>

      {/* おすすめ・履歴 */}
      <button
        onClick={() => setCurrentTab("history")}
        className="nav-tab-button"
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
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
        }}
      >
        <Sparkles size={16} />
        <span>おすすめ・履歴</span>
      </button>

      {/* 出品 */}
      <button
        onClick={() => setCurrentTab("sell")}
        className="nav-tab-button"
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
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
        }}
      >
        <Camera size={16} />
        <span>出品</span>
      </button>

      {/* マイページ */}
      <button
        onClick={() => setCurrentTab("mypage")}
        className="nav-tab-button"
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
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
        }}
      >
        <User size={16} />
        <span>マイページ</span>
      </button>
    </div>
  );
}

export default Navigation;
