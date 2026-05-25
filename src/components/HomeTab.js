import React, { useState } from "react";
import HorizontalItemList from "./HorizontalItemList";

function HomeTab({
  homePersonalized,
  homeUserFavorite,
  homeMarketFavorite,
  handleCardClick,
  handlePurchaseItem,
  onHomeSearch,
  setCurrentTab, // 💡 親からタブ切り替え関数を受け取る！
}) {
  const [localKeyword, setLocalKeyword] = useState("");

  // 🥇 1段目（あなたへのおすすめ）の表示用切り分け
  const firstHeroItem = homePersonalized[0];
  const remainingScrollItems = homePersonalized.slice(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "45px" }}>
      {/* 🔍 【AI空間検索コンテナー】 */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "18px" }}>✨</span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "900",
              color: "#312e81",
              letterSpacing: "0.5px",
            }}
          >
            商品検索
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="週末のカフェに合う落ち着いた服、Macに合う黒いガジェット... 🪄"
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

      {/* 📸 【新設】出品インフォメーション・特製ワイドバナー */}
      <div
        onClick={() => setCurrentTab("sell")} // 💡 タップされた瞬間、一撃で出品タブへワープ！
        style={{
          backgroundColor: "#f0fdf4", // 出品の楽しさと安心感を刺激する爽やかなライトグリーン
          border: "1px solid #bbf7d0",
          borderRadius: "20px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.02)",
          marginTop: "-25px", // 検索バーとの視覚的パッケージ感を出すための極上マージン数理
          marginBottom: "-10px",
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
          <span style={{ fontSize: "22px" }}>📸</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{ fontSize: "14px", fontWeight: "bold", color: "#166534" }}
            >
              使わなくなったアイテムを出品してみよう！
            </span>
            <span
              style={{ fontSize: "11px", color: "#15803d", fontWeight: "500" }}
            >
              AIが商品説明の自動生成や適正価格の査定をサポートします 🪄
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
              gap: "6px",
            }}
          >
            👑 <span className="ai-heading-text">あなたへのおすすめ</span>
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
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <span>
                  👤 出品者: {firstHeroItem.seller_name || "公式出品"}
                </span>
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
                  {firstHeroItem.status === "sold_out"
                    ? "売り切れ"
                    : "🛍️ 購入する"}
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

      {/* 🥈 2段目：あなたに人気のカテゴリー */}
      <div>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            margin: "0 0 12px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#333",
          }}
        >
          {homeUserFavorite.title || "👤 あなたに人気のカテゴリー"}
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
            <span>
              🛍️ <b>購入後に表示します</b>
            </span>
            <br />
            <span style={{ fontSize: "11px", color: "#cbd5e1" }}>
              商品を購入したり、お気に入り・閲覧をすると、AIがあなたの好みを数理分析して専用の特設カテゴリーを自動生成します。
            </span>
          </div>
        )}
      </div>

      {/* 🥉 3段目：市場全体で人気のカテゴリー */}
      {homeMarketFavorite.items && homeMarketFavorite.items.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#333",
            }}
          >
            {homeMarketFavorite.title}
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
