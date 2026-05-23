import React from "react";
import HorizontalItemList from "./HorizontalItemList";

function HomeTab({
  homePersonalized,
  homeUserFavorite,
  homeMarketFavorite,
  handleCardClick,
  handlePurchaseItem,
}) {
  // 🥇 1段目（あなたへのおすすめ）の表示用切り分け
  const firstHeroItem = homePersonalized[0];
  const remainingScrollItems = homePersonalized.slice(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "45px" }}>
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
              {/* 💡 justifyContent: "center" を滑り込ませます */}
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
              {/* 💡 左揃え ＆ 5行ラインクランプの魔法を注入 */}
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#4b5563",
                  lineHeight: "1.6",
                  textAlign: "left", // ✨ カチッと綺麗な左揃えに
                  display: "-webkit-box", // ✨ 複数行省略を有効にするおまじない
                  WebkitLineClamp: 5, // ✨ ここで最大「5行」に制限！
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden", // ✨ はみ出た文字を隠して「...」化
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
