import React, { useState, useEffect } from "react";
import NegotiationSection from "./NegotiationSection";
import DetailRecommendations from "./DetailRecommendations";
import {
  X,
  ShoppingBag,
  Heart,
  User,
  Sliders,
  Truck,
  SquarePen,
  XCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";

function ItemDetailModal({
  selectedItem,
  setSelectedItem,
  handlePurchaseItem,
  myAppId,
  userLikes,
  onLikeToggle,
  onNegotiationSuccess,
  setEditingItem,
  setCurrentTab,
}) {
  const [spaceItems, setSpaceItems] = useState([]);
  const [timeItems, setTimeItems] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(false);

  // AIが計算中, または妥協案提示の保留中にモーダルを強制ロックするState
  const [isModalLocked, setIsModalLocked] = useState(false);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  useEffect(() => {
    if (selectedItem) {
      const isLikedInitially = userLikes.some(
        (like) => like.id === selectedItem.id,
      );
      setLocalIsLiked(isLikedInitially);
    }
  }, [selectedItem, userLikes]);

  useEffect(() => {
    if (!selectedItem || !myAppId) return;

    fetch(`${API_URL}/items/${selectedItem.id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    }).catch((err) => console.error("閲覧履歴記録エラー:", err));

    setIsCalculating(true);
    setSpaceItems([]);
    setTimeItems([]);

    fetch(`${API_URL}/recommendations/${selectedItem.asin || selectedItem.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (
            data.carousel_space_similarity &&
            Array.isArray(data.carousel_space_similarity.items)
          ) {
            const filteredSpace = data.carousel_space_similarity.items.filter(
              (item) => item.id !== selectedItem.id,
            );
            setSpaceItems(filteredSpace.slice(0, 3));
          }
          if (
            data.carousel_time_transition &&
            Array.isArray(data.carousel_time_transition.items)
          ) {
            const filteredTime = data.carousel_time_transition.items.filter(
              (item) => item.id !== selectedItem.id,
            );
            setTimeItems(filteredTime.slice(0, 3));
          }
        }
      })
      .catch((err) => console.error("関連商品取得エラー:", err))
      .finally(() => setIsCalculating(false));
  }, [selectedItem, myAppId]);

  const handleLikeClick = () => {
    if (!myAppId || !selectedItem) return;
    setLocalIsLiked(!localIsLiked);

    fetch(`${API_URL}/items/${selectedItem.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") onLikeToggle();
      })
      .catch((err) => {
        console.error("いいね通信エラー:", err);
        setLocalIsLiked((prev) => !prev);
      });
  };

  // バックエンドの特権削除APIをシームレスにスナイプする非同期関数
  const handleDeleteItem = () => {
    if (
      !window.confirm(
        "この商品の出品を取り消しますか？（この操作は戻せません）",
      )
    )
      return;

    fetch(`${API_URL}/items/${selectedItem.id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          alert("出品を取り消しました。");
          setSelectedItem(null); // 1. モーダルを綺麗にクローズ
          window.location.reload(); // 2. タイムラインのデータを最新状態に再読込
        } else {
          alert("削除に失敗しました: " + data.message);
        }
      })
      .catch((err) => {
        console.error("削除エラー:", err);
        alert("通信エラーが発生しました。");
      });
  };

  if (!selectedItem) return null;
  const isSoldOut = selectedItem.status === "sold_out";

  // 出品スタンスが「値下げは考えていない」に指定されている場合は交渉不可とする判定フラグ
  const isNegotiable = selectedItem.seller_stance !== "値下げは考えていない";

  // この商品の出品者が、今ログインしている自分（myAppId）かどうかを厳格に判定
  const isMyItem =
    selectedItem.seller_id &&
    Number(selectedItem.seller_id) === Number(myAppId);

  // 過去にこの商品を値切ったことがあるかをlocalStorageのトークンからハント
  const hasAlreadyNegotiated =
    localStorage.getItem(
      `fleamarket_negotiated_${myAppId}_${selectedItem.id}`,
    ) === "true";

  // 訂正ボタンが押された時のフォーム復元ワープ処理
  const handleEditClick = () => {
    setEditingItem(selectedItem); // 1. この商品のすべてのデータを「編集対象」として親のStateにロックオン
    setCurrentTab("sell"); // 2. 画面のタブを出品フォーム（"sell"）に強制ワープ
    setSelectedItem(null); // 3. 開いている詳細モーダルを綺麗にクローズ
  };

  return (
    <div
      onClick={() => {
        // 💡 交渉中（モーダルロック時）は背景をクリックしても絶対に閉じないようにガード
        if (isModalLocked) return;
        setSelectedItem(null);
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()} // モーダル本体のクリックによるクローズを防止
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          maxWidth: "500px",
          width: "100%",
          padding: "25px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* ✕ボタンのモダン線画化 */}
        <button
          onClick={() => !isModalLocked && setSelectedItem(null)} // 💡 ロック中はクローズ関数を完全遮断
          disabled={isModalLocked}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            border: "none",
            backgroundColor: isModalLocked ? "#e5e7eb" : "#f3f4f6", // ロック時はグレーに
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: isModalLocked ? "not-allowed" : "pointer", // 禁止マークスタイル
            color: "#6b7280",
            transition: "background-color 0.2s",
          }}
        >
          <X size={15} />
        </button>

        <h2
          style={{
            margin: "0 0 15px 0",
            fontSize: "20px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ShoppingBag size={20} color="#333" /> <span>商品詳細</span>
        </h2>

        {/* 商品画像 */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "220px",
            marginBottom: "15px",
          }}
        >
          <img
            src={selectedItem.image_url}
            alt={selectedItem.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12px",
              display: "block",
              opacity: isSoldOut ? 0.4 : 1,
              filter: isSoldOut ? "grayscale(100%)" : "none",
              transition: "all 0.3s ease",
            }}
          />
          {isSoldOut && (
            <div className="sold-ribbon-container-large">
              <span className="sold-ribbon-text-large">SOLD</span>
            </div>
          )}
        </div>

        {/* タイトル & いいね */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: "10px",
            textAlign: "left",
            marginBottom: "12px",
          }}
        >
          <h3
            style={{ margin: 0, fontSize: "18px", flex: 1, lineHeight: "1.4" }}
          >
            {selectedItem.name}
          </h3>
          <button
            onClick={handleLikeClick}
            style={{
              backgroundColor: localIsLiked ? "#fff1f2" : "#f3f4f6",
              color: localIsLiked ? "#f43f5e" : "#9ca3af",
              border: localIsLiked ? "1px solid #fecdd3" : "1px solid #e5e7eb",
              borderRadius: "30px",
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <Heart
              size={14}
              fill={localIsLiked ? "#f43f5e" : "transparent"}
              color={localIsLiked ? "#f43f5e" : "#9ca3af"}
            />
            <span>{localIsLiked ? "いいね中" : "いいね"}</span>
          </button>
        </div>

        {/* タグ */}
        {selectedItem.tags && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <span
              style={{
                backgroundColor: "#e0e7ff",
                color: "#4f46e5",
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              #{selectedItem.tags}
            </span>
          </div>
        )}

        {/* メタデータシートの記号化 */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <User size={14} color="#64748b" />
              <span>出品者</span>
            </span>
            <span style={{ fontWeight: "700", color: "#334155" }}>
              {selectedItem.seller_name || "公式出品"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "8px",
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Sliders size={14} color="#64748b" /> <span>商品の状態</span>
            </span>
            <span style={{ fontWeight: "700", color: "#334155" }}>
              {selectedItem.item_condition || "目立った傷や汚れなし"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #e2e8f0",
              paddingTop: "8px",
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Truck size={14} color="#64748b" />
              <span>発送日の目安</span>
            </span>
            <span style={{ fontWeight: "700", color: "#334155" }}>
              {selectedItem.shipping_days || "1〜2日で発送"}
            </span>
          </div>
        </div>

        {/* 商品説明 */}
        <p
          style={{
            fontSize: "13px",
            color: "#475569",
            whiteSpace: "pre-wrap",
            backgroundColor: "#ffffff",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            margin: "0 0 15px 0",
            textAlign: "left",
            lineHeight: "1.6",
          }}
        >
          {selectedItem.description}
        </p>

        {/* 価格 & 今すぐ購入バー */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #eee",
            paddingTop: "15px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: isSoldOut ? "#94a3b8" : "#ff4d4d",
              textDecoration: isSoldOut ? "line-through" : "none",
            }}
          >
            {selectedItem.price.toLocaleString()} 円
          </span>

          {isMyItem && !isSoldOut ? (
            <button
              onClick={handleEditClick}
              style={{
                padding: "10px 24px",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "25px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <SquarePen size={16} />
              <span>出品内容を訂正する</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `${selectedItem.price.toLocaleString()}円でこの商品を購入しますか？`,
                  )
                ) {
                  handlePurchaseItem(selectedItem.id);
                }
              }}
              disabled={isSoldOut}
              style={{
                padding: "10px 24px",
                backgroundColor: isSoldOut ? "#cbd5e1" : "#ff4d4d",
                color: isSoldOut ? "#94a3b8" : "white",
                border: "none",
                borderRadius: "25px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: isSoldOut ? "not-allowed" : "pointer",
                boxShadow: isSoldOut
                  ? "none"
                  : "0 4px 12px rgba(255, 77, 77, 0.2)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {/* 💡 ボタン内の売り切れ・購入絵文字を完全リプレイス */}
              {isSoldOut ? (
                <>
                  <XCircle size={16} />
                  <span>売り切れました</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>今すぐ購入</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 🗑️ 出品取り消しセクション */}
        {isMyItem && selectedItem.status === "on_sale" && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "16px",
            }}
          >
            <button
              onClick={handleDeleteItem}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ffffff",
                color: "#ef4444",
                border: "1px solid #fca5a5",
                borderRadius: "25px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fef2f2";
                e.currentTarget.style.borderColor = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.borderColor = "#fca5a5";
              }}
            >
              <Trash2 size={14} />
              <span>この出品を取り消す</span>
            </button>
          </div>
        )}

        {/* 交渉セクション */}
        {selectedItem.id >= 100000 &&
          !isSoldOut &&
          isNegotiable &&
          !isMyItem &&
          !hasAlreadyNegotiated && (
            <NegotiationSection
              itemId={selectedItem.id}
              currentPrice={selectedItem.price}
              myAppId={myAppId}
              onNegotiationSuccess={onNegotiationSuccess}
              setIsModalLocked={setIsModalLocked}
            />
          )}

        {/* 交渉履歴バナー */}
        {hasAlreadyNegotiated && !isSoldOut && !isMyItem && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              backgroundColor: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: "12px",
              color: "#e11d48",
              fontSize: "12px",
              fontWeight: "bold",
              textAlign: "center",
              animation: "fadeIn 0.2s ease-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />{" "}
            <span>
              この商品に対するあなたのAI代理交渉枠（1人1商品につき1回限定）は既に消費されています。
            </span>
          </div>
        )}

        {/* 2段多次元AI推薦エリア */}
        <DetailRecommendations
          isCalculating={isCalculating}
          spaceItems={spaceItems}
          timeItems={timeItems}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </div>
  );
}

export default ItemDetailModal;
