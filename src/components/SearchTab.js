import React, { useState, useEffect } from "react";
import ItemList from "./ItemList";
import {
  Search,
  Sparkles,
  Bell,
  Filter,
  Tag,
  Sliders,
  ArrowUpDown,
  Box,
  ChevronDown,
  Loader2,
} from "lucide-react";

const AMAZON_CATEGORIES_FOR_SEARCH = [
  {
    value: "Clothing_Shoes_and_Jewelry",
    label: "服・靴・ファッション小物 (Clothing_Shoes_and_Jewelry)",
  },
  { value: "Amazon_Fashion", label: "公式ファッション (Amazon_Fashion)" },
  {
    value: "Beauty_and_Personal_Care",
    label: "コスメ・パーソナルケア (Beauty_and_Personal_Care)",
  },
  { value: "All_Beauty", label: "ビューティー・コスメ全般 (All_Beauty)" },

  {
    value: "Cell_Phones_and_Accessories",
    label: "スマートフォン・携帯アクセサリ (Cell_Phones_and_Accessories)",
  },
  { value: "Electronics", label: "家電・カメラ・オーディオ (Electronics)" },
  { value: "Video_Games", label: "テレビゲーム・機材 (Video_Games)" },
  { value: "Appliances", label: "大型家電・家庭用機器 (Appliances)" },

  {
    value: "Toys_and_Games",
    label: "おもちゃ・ホビー・ゲーム (Toys_and_Games)",
  },
  { value: "Books", label: "本・書籍 (Books)" },
  { value: "CDs_and_Vinyl", label: "CD・レコード・音楽 (CDs_and_Vinyl)" },
  { value: "Movies_and_TV", label: "DVD・ブルーレイ・映画 (Movies_and_TV)" },
  {
    value: "Musical_Instruments",
    label: "楽器・音響機器 (Musical_Instruments)",
  },
  { value: "Handmade_Products", label: "ハンドメイド作品 (Handmade_Products)" },

  {
    value: "Home_and_Kitchen",
    label: "ホーム＆キッチン・家具 (Home_and_Kitchen)",
  },
  { value: "Office_Products", label: "オフィス用品・文房具 (Office_Products)" },
  { value: "Pet_Supplies", label: "ペット用品 (Pet_Supplies)" },
  {
    value: "Grocery_and_Gourmet_Food",
    label: "食品・飲料・お酒 (Grocery_and_Gourmet_Food)",
  },

  {
    value: "Sports_and_Outdoors",
    label: "スポーツ＆アウトドア (Sports_and_Outdoors)",
  },
  {
    value: "Tools_and_Home_Improvement",
    label: "工具・DIY・住宅設備 (Tools_and_Home_Improvement)",
  },
  {
    value: "Patio_Lawn_and_Garden",
    label: "ガーデン・エクステリア (Patio_Lawn_and_Garden)",
  },
  { value: "Automotive", label: "車・バイク用品 (Automotive)" },
];

const ITEM_CONDITIONS = [
  "新品・未使用",
  "未使用に近い",
  "目立った傷や汚れなし",
  "やや傷や汚れあり",
  "傷や汚れあり",
  "全体的に状態が悪い",
];

function SearchTab({
  items,
  homeItems,
  handleCardClick,
  handlePurchaseItem,
  moodText,
  setMoodText,
  recommendMode,
  setRecommendMode,
  isRecommending,
  handleAiRecommend,
  handleResetRecommend,
  filterStatus,
  setFilterStatus,
}) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [keywordFilter, setKeywordFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");

  const [sortOrder, setSortOrder] = useState("ai_match");
  const [visibleCount, setVisibleCount] = useState(20);
  const [isWishlisting, setIsWishlisting] = useState(false);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // 検索条件が変わったら表示件数をリセット
  useEffect(() => {
    setVisibleCount(20);
  }, [
    categoryFilter,
    keywordFilter,
    conditionFilter,
    sortOrder,
    moodText,
    filterStatus,
  ]);

  // AI検索結果があればそれを、なければ全アイテムをベースにする
  const baseItems =
    Array.isArray(homeItems) && homeItems.length > 0 ? homeItems : items;

  // 入荷待ち登録
  const handleAddToWishlist = () => {
    if (!(moodText || "").trim()) {
      alert("欲しい商品のイメージ（キーワード）を入力してください！");
      return;
    }

    const savedAccounts = JSON.parse(
      localStorage.getItem("fleamarket_authenticated_accounts") || "[]",
    );
    const activeAccount = savedAccounts[0];
    const userId = activeAccount ? activeAccount.id : 1;

    setIsWishlisting(true);

    fetch(`${API_URL}/wishlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        keywords: moodText.trim(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          alert(
            `AI入荷待ち登録が完了しました！\n\n今後、他のユーザーから「${moodText.trim()}」のイメージにマッチする商品が出品された瞬間に、リアルタイムで通知が届きます！`,
          );
        } else {
          alert("入荷待ち登録に失敗しました。");
        }
      })
      .catch((err) => {
        console.error("入荷待ち登録エラー:", err);
        alert("通信エラーが発生しました。");
      })
      .finally(() => setIsWishlisting(false));
  };

  // フィルターロジック
  let filteredItems = baseItems.filter((item) => {
    if (!item) return false;

    const itemCategory = item.ai_category || item.tags;

    if (categoryFilter && itemCategory !== categoryFilter) return false;

    if (keywordFilter) {
      const query = keywordFilter.toLowerCase().trim();
      const tagMatch = itemCategory
        ? String(itemCategory).toLowerCase().includes(query)
        : false;
      const nameMatch = item.name
        ? item.name.toLowerCase().includes(query)
        : false;
      const descMatch = item.description
        ? item.description.toLowerCase().includes(query)
        : false;
      if (!tagMatch && !nameMatch && !descMatch) return false;
    }

    if (filterStatus === "active" && item.status !== "on_sale") return false;
    if (filterStatus === "sold_out" && item.status !== "sold_out") return false;

    if (conditionFilter) {
      const itemCondition = item.item_condition || "新品・未使用";
      if (itemCondition !== conditionFilter) return false;
    }

    return true;
  });

  // 並び替えロジック
  let sortedItems = [...filteredItems];
  if (sortOrder === "ai_match") {
    sortedItems.sort((a, b) => {
      const scoreA = a.score !== undefined ? parseFloat(a.score) : 0;
      const scoreB = b.score !== undefined ? parseFloat(b.score) : 0;
      return scoreB - scoreA;
    });
  } else if (sortOrder === "new") {
    sortedItems.sort((a, b) => b.id - a.id);
  } else if (sortOrder === "price_asc") {
    sortedItems.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "price_desc") {
    sortedItems.sort((a, b) => b.price - a.price);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      <style>{`
        @media (max-width: 640px) {
          .responsive-search-block { flex-direction: column !important; gap: 10px !important; }
          .responsive-search-button { width: 100% !important; padding: 12px 0 !important; height: auto !important; }
        }
      `}</style>

      {/* タイトルセクションのスマート化 */}
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
          margin: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <Search size={20} color="#333" />
        <span>商品検索</span>
      </h2>

      {/* 検索エリア */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <Sparkles size={18} color="#4f46e5" />{" "}
            <h3
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: "900",
                color: "#312e81",
                letterSpacing: "0.5px",
              }}
            >
              AIに欲しいイメージを伝える
            </h3>
          </div>

          <div
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            {/* 💡 クラス名「responsive-search-block」をマウント */}
            <div
              className="responsive-search-block"
              style={{ display: "flex", gap: "10px" }}
            >
              <input
                type="text"
                placeholder="キーワードを入力（例: レザージャケット）"
                value={moodText || ""}
                onChange={(e) => setMoodText(e.target.value)}
                disabled={isRecommending}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "2px solid #a5b4fc",
                  fontSize: "15px",
                  outline: "none",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <button
                className="responsive-search-button"
                onClick={handleAiRecommend}
                disabled={isRecommending || !(moodText || "").trim()}
                style={{
                  padding: "0 24px",
                  backgroundColor:
                    isRecommending || !(moodText || "").trim()
                      ? "#c7d2fe"
                      : "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "900",
                  fontSize: "15px",
                  cursor:
                    isRecommending || !(moodText || "").trim()
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    isRecommending || !(moodText || "").trim()
                      ? "none"
                      : "0 4px 6px rgba(79, 70, 229, 0.3)",
                  whiteSpace: "nowrap",
                }}
              >
                {isRecommending ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Loader2 size={16} className="animate-spin" />
                    <span>計算中...</span>
                  </span>
                ) : (
                  "検索する"
                )}
              </button>
            </div>

            {/* AI入荷待ちボードの極限洗練化 */}
            {(moodText || "").trim() && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "14px 16px",
                  backgroundColor: "#f5f3ff",
                  border: "1px solid #ddd6fe",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  animation: "fadeIn 0.3s ease-out",
                  boxShadow: "0 4px 6px -1px rgba(109, 40, 217, 0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "start",
                    gap: "10px",
                    flex: 1,
                  }}
                >
                  <Bell
                    size={16}
                    color="#6d28d9"
                    style={{ marginTop: "2px", flexShrink: 0 }}
                  />
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6d28d9",
                      lineHeight: "1.5",
                      fontWeight: "500",
                    }}
                  >
                    欲しい商品が見つかりませんか？ このキーワード「
                    <strong>{moodText}</strong>
                    」を登録しておくと、条件に合致する品が新しく出品された瞬間に通知します！
                  </div>
                </div>
                <button
                  onClick={handleAddToWishlist}
                  disabled={isWishlisting}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: isWishlisting ? "#c084fc" : "#7c3aed",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    cursor: isWishlisting ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: isWishlisting
                      ? "none"
                      : "0 4px 6px rgba(124, 58, 237, 0.2)",
                  }}
                >
                  {isWishlisting ? "登録中..." : "入荷待ち登録"}
                </button>
              </div>
            )}

            {baseItems === homeItems && homeItems.length > 0 && (
              <div style={{ textAlign: "right" }}>
                <button
                  onClick={() => {
                    handleResetRecommend();
                    setCategoryFilter("");
                    setKeywordFilter("");
                    setConditionFilter("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: "13px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  検索結果をリセット
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 下段：物理フィルターの整列構造 */}
        <div
          style={{
            padding: "20px 24px",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* 表示対象 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#6b7280",
                letterSpacing: "0.5px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Filter size={14} color="#6b7280" /> <span>表示対象</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "20px",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              <label
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <input
                  type="radio"
                  value="both"
                  checked={filterStatus === "both"}
                  onChange={() => setFilterStatus("both")}
                  style={{
                    accentColor: "#4f46e5",
                    width: "16px",
                    height: "16px",
                  }}
                />{" "}
                すべて
              </label>
              <label
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <input
                  type="radio"
                  value="active"
                  checked={filterStatus === "active"}
                  onChange={() => setFilterStatus("active")}
                  style={{
                    accentColor: "#4f46e5",
                    width: "16px",
                    height: "16px",
                  }}
                />{" "}
                販売中
              </label>
              <label
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <input
                  type="radio"
                  value="sold_out"
                  checked={filterStatus === "sold_out"}
                  onChange={() => setFilterStatus("sold_out")}
                  style={{
                    accentColor: "#4f46e5",
                    width: "16px",
                    height: "16px",
                  }}
                />{" "}
                売切
              </label>
            </div>
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid #f1f5f9",
              margin: "0",
            }}
          />

          {/* セレクトボックス群 */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div
              style={{
                flex: "1 1 220px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#6b7280",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Tag size={13} color="#6b7280" />
                <span>カテゴリー</span>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  cursor: "pointer",
                  height: "40px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                <option value="">▼ すべてのカテゴリー</option>
                {AMAZON_CATEGORIES_FOR_SEARCH.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                flex: "1 1 220px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#6b7280",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sliders size={13} color="#6b7280" />
                <span>商品の状態</span>
              </div>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  cursor: "pointer",
                  height: "40px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                <option value="">▼ すべての状態</option>
                {ITEM_CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid #f1f5f9",
              margin: "0",
            }}
          />

          {/* キーワード ＆ 並び替え */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <input
              type="text"
              placeholder="さらにキーワードで絞り込む（例: black, leather）"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              style={{
                flex: "1 1 200px",
                maxWidth: "380px",
                padding: "8px 14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "13px",
                outline: "none",
                height: "20px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                flexShrink: 0,
              }}
            >
              <ArrowUpDown size={16} color="#64748b" />{" "}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                  height: "38px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                <option value="ai_match">AIおすすめ順</option>
                <option value="new">新しい順</option>
                <option value="price_asc">安い順</option>
                <option value="price_desc">高い順</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 検索結果表示エリア */}
      <div>
        <div
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {sortOrder === "ai_match" &&
          baseItems === homeItems &&
          homeItems.length > 0 ? (
            <>
              <Sparkles size={14} color="#6b7280" />
              <span>マッチ度順: </span>
            </>
          ) : (
            <>
              <Box size={14} color="#6b7280" /> <span>表示中の商品: </span>
            </>
          )}
          <b style={{ color: "#111827", fontSize: "15px" }}>
            {sortedItems.length}
          </b>{" "}
          件
        </div>

        {sortedItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "60px 0",
              fontSize: "14px",
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px dashed #d1d5db",
            }}
          >
            該当する商品が見つかりませんでした。
            <br />
            条件を変えてみてください。
          </div>
        ) : (
          <>
            <div onClick={(e) => handleCardClick(e, sortedItems)}>
              <ItemList
                items={sortedItems.slice(0, visibleCount)}
                handlePurchaseItem={handlePurchaseItem}
              />
            </div>

            {sortedItems.length > visibleCount && (
              <div style={{ textAlign: "center", marginTop: "30px" }}>
                <button
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  style={{
                    padding: "14px 40px",
                    backgroundColor: "white",
                    color: "#ff4d4d",
                    border: "2px solid #ff4d4d",
                    borderRadius: "30px",
                    fontWeight: "900",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(255, 77, 77, 0.1)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <ChevronDown size={16} />
                  <span>さらに商品を表示する</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchTab;
