import React, { useState, useEffect } from "react";
import { Bell, User } from "lucide-react";

function Header({
  loginUser,
  handleLogout,
  setCurrentTab,
  myAppId,
  setActiveTransactionId,
}) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // ブラウザの永続ストレージからログイン履歴のあるアカウント達をロード
  const savedAccounts = JSON.parse(
    localStorage.getItem("fleamarket_authenticated_accounts") || "[]",
  );

  // 現在アクティブな会員ID（myAppId）に合致するアカウントのメールアドレスを動的ハント
  const currentActiveAccount = savedAccounts.find(
    (acc) => acc.id === myAppId,
  ) || {
    email: loginUser?.email || "ゲストユーザー",
  };

  // 仕組み1: 裏側に新設した通知APIから、3秒ごとに通知をフェッチ
  useEffect(() => {
    if (!myAppId) return;

    const fetchNotifications = () => {
      fetch(`${API_URL}/users/${myAppId}/notifications`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch((err) => console.error("通知取得エラー:", err));
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000); // 3秒自動同期
    return () => clearInterval(interval);
  }, [myAppId]);

  // 未読の通知カウントを算出
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // 通知をクリックした時の既読化 ＆ 画面ワープ処理
  const handleNotificationClick = (notif) => {
    // 1. バックエンドを既読状態へコミット
    fetch(`${API_URL}/notifications/${notif.id}/read`, { method: "POST" })
      .then(() => {
        // ローカルの状態を更新
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)),
        );
      })
      .catch((err) => console.error("既読処理エラー:", err));

    // 2. 通知のコンテキストに応じて、適切なタブへユーザーを誘導
    if (notif.title.includes("入荷")) {
      setCurrentTab("search");
    } else {
      setCurrentTab("mypage");
    }
    setShowDropdown(false);
  };

  return (
    <header
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #f3f4f6",
        padding: "0 16px", // スマホの端の詰まりを考慮して20pxから16pxに最適化
        height: "60px",
        position: "sticky",
        top: 0,
        zIndex: 101,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .nav-email-text { display: none !important; } 
          .nav-logo-text { font-size: 18px !important; } 
          .nav-logo-icon { width: 30px !important; height: 30px !important; } 
          .nav-logo-icon span { font-size: 16px !important; }
          .nav-logo-large-n { font-size: 24px !important; }
          .nav-right-container { gap: 12px !important; }
          .nav-dropdown-menu { right: 16px !important; width: 280px !important; }
        }
      `}</style>

      {/* ロゴコンテナ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
        onClick={() => setCurrentTab("home")}
      >
        {/* グラデーションアイコン */}
        <div
          className="nav-logo-icon"
          style={{
            width: "36px",
            height: "36px",
            background: "linear-gradient(135deg, #7c3aed 0%, #ff4d4d 100%)",
            borderRadius: "10px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(255, 77, 77, 0.2)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "white",
              fontStyle: "italic",
              fontWeight: "900",
              fontSize: "20px",
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              transform: "translateX(-0.5px)",
            }}
          >
            N
          </span>
        </div>

        {/* テキストロゴ */}
        <h1
          className="nav-logo-text"
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "500",
            fontFamily: '"Helvetica Neue", Arial, system-ui, sans-serif',
            letterSpacing: "-0.5px",
            color: "#4e4a4ee7",
          }}
        >
          <span
            className="nav-logo-large-n"
            style={{
              fontStyle: "italic",
              fontWeight: "900",
              fontSize: "32px",
              color: "#f64574e6",
              marginRight: "2px",
            }}
          >
            N
          </span>
          -Frima
        </h1>
      </div>

      {loginUser && (
        <div
          className="nav-right-container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "14px",
            color: "#333",
            position: "relative",
          }}
        >
          {/* 通知センターボタン */}
          <div
            style={{
              position: "relative",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell size={20} color="#4b5563" />{" "}
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  backgroundColor: "#ff4d4d",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          {/* 通知ドロップダウンメニュー */}
          {showDropdown && (
            <div
              className="nav-dropdown-menu"
              style={{
                position: "absolute",
                top: "35px",
                right: "120px",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                width: "320px",
                maxHeight: "360px",
                overflowY: "auto",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 200,
              }}
            >
              <div
                style={{
                  padding: "12px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  borderBottom: "1px solid #f3f4f6",
                  color: "#4f46e5",
                }}
              >
                お知らせ・新着通知
              </div>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "13px",
                  }}
                >
                  現在、通知はありません
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f9fafb",
                      backgroundColor: notif.is_read ? "white" : "#f0f5ff",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = notif.is_read
                        ? "white"
                        : "#f0f5ff")
                    }
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "13px",
                        color: "#1f2937",
                      }}
                    >
                      {notif.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#4b5563",
                        marginTop: "4px",
                        lineHeight: "1.4",
                        textAlign: "left",
                      }}
                    >
                      {notif.message}
                    </div>

                    <div
                      style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        marginTop: "6px",
                      }}
                    >
                      {(() => {
                        const raw = notif.created_at;
                        const utcString =
                          raw.includes("Z") || raw.includes("+")
                            ? raw
                            : `${raw.replace(" ", "T")}Z`;
                        const dateObj = new Date(utcString);
                        const finalDate = isNaN(dateObj.getTime())
                          ? new Date(raw)
                          : dateObj;

                        return finalDate.toLocaleString("ja-JP", {
                          timeZone: "Asia/Tokyo",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* アクティブユーザーのメアド表示 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            <User size={16} color="#4b5563" />{" "}
            <span className="nav-email-text">{currentActiveAccount.email}</span>
          </div>

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
              whiteSpace: "nowrap",
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
