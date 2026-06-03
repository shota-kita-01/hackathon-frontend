import React, { useState } from "react";
import HorizontalItemList from "./HorizontalItemList";
import {
  Search,
  Bell,
  Sparkles,
  ShoppingBag,
  Camera,
  User,
} from "lucide-react"; // 💡 Camera と User をハント！

function HomeTab({
  homePersonalized,
  homeUserFavorite,
  homeMarketFavorite,
  handleCardClick,
  handlePurchaseItem,
  onHomeSearch,
  setCurrentTab,
}) {
  const [localKeyword, setLocalKeyword] = useState("");
  const [newWishText, setNewWishText] = useState("");

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  const firstHeroItem = homePersonalized[0];
  const remainingScrollItems = homePersonalized.slice(1);
  const handleAddToWishlistFromHome = (e) => {
    e.preventDefault();
    if (!newWishText.trim()) return;

    // キャッシュから現在ログイン中の会員IDを動的にハント
    const savedAccounts = JSON.parse(
      localStorage.getItem("fleamarket_authenticated_accounts") || "[]",
    );
    const activeAccount = savedAccounts[0];
    const userId = activeAccount ? activeAccount.id : 1;

    fetch(`${API_URL}/wishlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        keywords: newWishText.trim(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          alert(
            `AI入荷待ち登録が完了しました。\n今後、他のユーザーから「${newWishText.trim()}」にマッチする商品が出品された瞬間に、通知センターへ通知が届きます！`,
          );
          setNewWishText(""); // 入力欄をクリア
        }
      })
      .catch((err) =>
        console.error("ホームからのウィッシュリスト登録エラー:", err),
      );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "45px" }}>
      {/* 💡 ホーム画面の最上部：中揃え ＆ 2倍スケールアップ版 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px",
          cursor: "pointer",
          alignSelf: "center",
          marginTop: "20px",
        }}
        onClick={() => setCurrentTab("home")}
      >
        {/* グラデーションアイコン（すべて2倍） */}
        <div
          style={{
            width: "90px",
            height: "90px",
            background: "linear-gradient(135deg, #7c3aed 0%, #ff4d4d 100%)",
            borderRadius: "25px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(255, 77, 77, 0.2)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "white",
              fontStyle: "italic",
              fontWeight: "900",
              fontSize: "50px",
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              transform: "translateX(-1px)",
            }}
          >
            N
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "60px",
            fontWeight: "500",
            fontFamily: '"Helvetica Neue", Arial, system-ui, sans-serif',
            letterSpacing: "-1px",
            color: "#605c60e7",
          }}
        >
          <span
            style={{
              fontStyle: "italic",
              fontWeight: "900",
              fontSize: "80px",
              color: "#ff4d85db",
              marginRight: "5px",
            }}
          >
            N
          </span>
          -Frima
        </h1>
      </div>

      {/* AI空間検索コンテナー */}
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          marginTop: "-10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Search size={15} color="#312e81" /> {/* 💡 虫眼鏡アイコンをセット */}
          <span
            style={{
              fontSize: "13px",
              fontWeight: "900",
              color: "#312e81",
              letterSpacing: "0.5px",
            }}
          >
            商品を探す
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="キーワードを入力（例: レザージャケット）"
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && localKeyword.trim()) {
                onHomeSearch(localKeyword);
              }
            }}
            style={{
              flex: 1,
              padding: "14px 20px",
              border: "1px solid #cbd5e1",
              borderRadius: "30px",
              fontSize: "14px",
              backgroundColor: "#f8fafc",
              outline: "none",
              color: "#334155",
            }}
          />
          <button
            onClick={() => {
              if (localKeyword.trim()) onHomeSearch(localKeyword);
            }}
            style={{
              padding: "0 28px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "30px",
              fontWeight: "900",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
              transition: "all 0.2s",
            }}
          >
            検索する
          </button>
        </div>
      </div>

      {/* 出品インフォメーション・特製ワイドバナー */}
      <div
        onClick={() => setCurrentTab("sell")}
        style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "20px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.02)",
          marginTop: "-25px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#e8fdf0")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#f0fdf4")
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Camera size={22} color="#166534" />{" "}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{ fontSize: "14px", fontWeight: "bold", color: "#166534" }}
            >
              使わなくなったアイテムを出品してみよう！
            </span>
            <span
              style={{ fontSize: "11px", color: "#15803d", fontWeight: "500" }}
            >
              AIが商品説明の自動生成や適正価格の査定をサポートします
            </span>
          </div>
        </div>
        <span
          style={{
            color: "#166534",
            fontWeight: "900",
            fontSize: "16px",
            paddingRight: "4px",
          }}
        >
          ➔
        </span>
      </div>

      {/* AIウィッシュリスト・ホームアピール窓 */}
      <div
        style={{
          backgroundColor: "#f5f3ff",
          border: "1px solid #ddd6fe",
          borderRadius: "20px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 4px 6px -1px rgba(109, 40, 217, 0.03)",
          marginTop: "-25px",
          marginBottom: "-10px",
        }}
      >
        {/* メインタイトル */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            color: "#6d28d9",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Bell size={16} color="#6d28d9" />{" "}
          見つからない商品はAI入荷待ちへ登録！
        </div>

        {/* 白抜き追加フォーム */}
        <div
          style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #e9d5ff",
          }}
        >
          <div
            style={{
              fontSize: "12.3px",
              fontWeight: "bold",
              color: "#7c3aed",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={14} color="#7c3aed" />{" "}
            <span>
              欲しい商品のイメージを登録しておくと、出品された瞬間にリアルタイムでお知らせします
            </span>
          </div>
          <form
            onSubmit={handleAddToWishlistFromHome}
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              placeholder="例：レトロな木製スピーカー、1990年代の古着ジャケット"
              value={newWishText}
              onChange={(e) => setNewWishText(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #bfdbfe",
                outline: "none",
                fontSize: "13px",
              }}
            />
            <button
              type="submit"
              disabled={!newWishText.trim()}
              style={{
                padding: "0 18px",
                backgroundColor: newWishText.trim() ? "#7c3aed" : "#c084fc",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: newWishText.trim() ? "pointer" : "not-allowed",
              }}
            >
              登録する
            </button>
          </form>
        </div>
      </div>

      {/* 🥇 1段目：あなたへのおすすめ（Top 5） */}
      {firstHeroItem && (
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              margin: "0 0 15px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Sparkles size={18} color="#4f46e5" />{" "}
            <span className="ai-heading-text">あなたへのおすすめ</span>
          </h3>

          {/* 1件目の特製ビッグカード */}
          <div
            className="item-card"
            onClick={() => handleCardClick(firstHeroItem)}
            style={{
              backgroundColor:
                firstHeroItem.status === "sold_out" ? "#f9fafb" : "white",
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "relative",
              cursor: "pointer",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                borderRadius: "14px",
                backgroundColor: "#f3f4f6",
              }}
            >
              <img
                src={firstHeroItem.image_url}
                alt={firstHeroItem.name}
                style={{
                  width: "100%",
                  height: "280px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  display: "block",
                  opacity: firstHeroItem.status === "sold_out" ? 0.4 : 1,
                  filter:
                    firstHeroItem.status === "sold_out"
                      ? "grayscale(100%)"
                      : "none",
                }}
              />
              {firstHeroItem.status === "sold_out" && (
                <div className="sold-ribbon-container-large">
                  <span className="sold-ribbon-text-large">SOLD</span>
                </div>
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "900",
                  color:
                    firstHeroItem.status === "sold_out" ? "#9ca3af" : "#111827",
                  lineHeight: "1.4",
                }}
              >
                {firstHeroItem.name}
              </h2>
              <div
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <User size={14} color="#9ca3af" />{" "}
                <span>出品者: {firstHeroItem.seller_name || "公式出品"}</span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#4b5563",
                  lineHeight: "1.6",
                  textAlign: "left",
                  display: "-webkit-box",
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {firstHeroItem.description}
              </p>

              {(firstHeroItem.tags || firstHeroItem.ai_category) && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      padding: "4px 10px",
                      backgroundColor: "#e0e7ff",
                      color: "#4338ca",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    #{firstHeroItem.tags || firstHeroItem.ai_category}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                  borderTop: "1px solid #f3f4f6",
                  paddingTop: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "900",
                    color:
                      firstHeroItem.status === "sold_out"
                        ? "#9ca3af"
                        : "#ff4d4d",
                  }}
                >
                  {firstHeroItem.price.toLocaleString()} 円
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchaseItem(firstHeroItem.id);
                  }}
                  disabled={firstHeroItem.status === "sold_out"}
                  style={{
                    padding: "10px 24px",
                    backgroundColor:
                      firstHeroItem.status === "sold_out"
                        ? "#d1d5db"
                        : "#ff4d4d",
                    color: "white",
                    border: "none",
                    borderRadius: "24px",
                    fontWeight: "900",
                    fontSize: "14px",
                    cursor:
                      firstHeroItem.status === "sold_out"
                        ? "not-allowed"
                        : "pointer",
                    boxShadow:
                      firstHeroItem.status === "sold_out"
                        ? "none"
                        : "0 4px 12px rgba(255, 77, 77, 0.2)",
                  }}
                >
                  {firstHeroItem.status === "sold_out" ? (
                    "売り切れ"
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ShoppingBag size={14} /> <span>購入する</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {remainingScrollItems.length > 0 && (
            <HorizontalItemList
              items={remainingScrollItems}
              handlePurchaseItem={handlePurchaseItem}
              handleCardClick={handleCardClick}
            />
          )}
        </div>
      )}

      {/* あなたに人気のカテゴリー */}
      <div>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            margin: "0 0 12px 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#333",
          }}
        >
          <User size={18} color="#333" />{" "}
          <span>{homeUserFavorite.title || "あなたに人気のカテゴリー"}</span>
        </h3>
        {homeUserFavorite.items && homeUserFavorite.items.length > 0 ? (
          <HorizontalItemList
            items={homeUserFavorite.items}
            handlePurchaseItem={handlePurchaseItem}
            handleCardClick={handleCardClick}
          />
        ) : (
          <div
            style={{
              padding: "30px 24px",
              color: "#9ca3af",
              fontSize: "13px",
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px dashed #d1d5db",
              textAlign: "center",
              fontWeight: "500",
              lineHeight: "1.6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "4px",
              }}
            >
              <ShoppingBag size={16} color="#9ca3af" />{" "}
              <span>
                <b>購入後に表示します</b>
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "#cbd5e1" }}>
              商品を購入したり、お気に入り・閲覧をすると、AIがあなたの好みを数理分析して専用の特設カテゴリーを自動生成します。
            </span>
          </div>
        )}
      </div>

      {/* 市場全体で人気のカテゴリー */}
      {homeMarketFavorite.items && homeMarketFavorite.items.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#333",
            }}
          >
            <ShoppingBag size={18} color="#333" />{" "}
            <span>{homeMarketFavorite.title}</span>
          </h3>
          <HorizontalItemList
            items={homeMarketFavorite.items}
            handlePurchaseItem={handlePurchaseItem}
            handleCardClick={handleCardClick}
          />
        </div>
      )}
    </div>
  );
}

export default HomeTab;
