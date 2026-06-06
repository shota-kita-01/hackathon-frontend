import React, { useState, useEffect } from "react";
import HorizontalItemList from "./HorizontalItemList";
// 💡 マイページの豊富なセクションや状態をクリーンに表現するインテリジェントアイコン群
import {
  User,
  Truck,
  Users,
  Trash2,
  Plus,
  Target,
  Sparkles,
  Loader2,
  ShoppingBag,
  Camera,
  Flag,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

function MyPageTab({
  myAppId,
  loginUser,
  handleCardClick,
  handlePurchaseItem,
  setMyAppId,
  handleLogout,
  setActiveTransactionId,
  setCurrentTab,
}) {
  const [purchasedItems, setPurchasedItems] = useState([]); // 購入履歴
  const [myProducts, setMyProducts] = useState([]); // 出品履歴
  const [activeTransactions, setActiveTransactions] = useState([]); // 進行中の取引
  const [completedTransactions, setCompletedTransactions] = useState([]); // 完了済みの過去取引
  const [wishlists, setWishlists] = useState([]); // 入荷待ちキーワードリスト
  const [newWishText, setNewWishText] = useState(""); // マイページ直接登録用
  const [isLoading, setIsLoading] = useState(true);

  // 👥 ブラウザの永続ストレージからロード
  const [accountList, setAccountList] = useState(() => {
    const saved = localStorage.getItem("fleamarket_authenticated_accounts");
    return saved ? JSON.parse(saved) : [];
  });

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  const fetchMyPageData = () => {
    if (!myAppId) return;

    const p1 = fetch(`${API_URL}/users/${myAppId}/purchases`).then((res) =>
      res.json(),
    );
    const p2 = fetch(`${API_URL}/users/${myAppId}/products`).then((res) =>
      res.json(),
    );
    const p3 = fetch(`${API_URL}/users/${myAppId}/transactions`).then((res) =>
      res.json(),
    );
    const p4 = fetch(`${API_URL}/users/${myAppId}/transactions/completed`).then(
      (res) => res.json(),
    );
    const p5 = fetch(`${API_URL}/users/${myAppId}/wishlists`).then((res) =>
      res.json(),
    );

    Promise.all([p1, p2, p3, p4, p5])
      .then(
        ([
          purchasesData,
          productsData,
          txData,
          completedTxData,
          wishlistData,
        ]) => {
          if (Array.isArray(purchasesData)) setPurchasedItems(purchasesData);
          if (Array.isArray(productsData)) setMyProducts(productsData);
          if (Array.isArray(txData)) setActiveTransactions(txData);
          if (Array.isArray(completedTxData))
            setCompletedTransactions(completedTxData);
          if (Array.isArray(wishlistData)) setWishlists(wishlistData);
        },
      )
      .catch((err) => console.error("マイページデータ取得エラー:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!myAppId) return;
    setIsLoading(true);
    fetchMyPageData();
    const timer = setInterval(fetchMyPageData, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAppId]);

  const handleAddWishlistFromMyPage = (e) => {
    e.preventDefault();
    if (!newWishText.trim()) return;

    fetch(`${API_URL}/wishlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: myAppId,
        keywords: newWishText.trim(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setNewWishText("");
          fetchMyPageData();
        }
      })
      .catch((err) => console.error("ウィッシュリスト登録エラー:", err));
  };

  const handleDeleteWishlist = (wishlistId, keywords) => {
    if (!window.confirm(`「${keywords}」の入荷待ちアラートを解除しますか？`))
      return;

    fetch(`${API_URL}/wishlists/${wishlistId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        fetchMyPageData();
      })
      .catch((err) => console.error("入荷待ち解除エラー:", err));
  };

  const handleAddAccount = () => {
    if (
      window.confirm(
        "現在のアカウントのログイン情報をリストに保持したまま、別のアカウントを追加しますか？",
      )
    ) {
      const saved = localStorage.getItem("fleamarket_authenticated_accounts");
      let currentList = saved ? JSON.parse(saved) : [];

      const currentAccountData = {
        id: myAppId,
        name: loginUser?.email ? loginUser.email.split("@")[0] : "ユーザー",
        email: loginUser?.email || "",
      };

      if (!currentList.some((acc) => String(acc.id) === String(myAppId))) {
        currentList.push(currentAccountData);
        localStorage.setItem(
          "fleamarket_authenticated_accounts",
          JSON.stringify(currentList),
        );
      }

      handleLogout(false);
    }
  };

  const handleActiveAccountLogout = () => {
    if (
      !window.confirm(
        "現在アクティブなこのアカウントのログイン情報を端末から完全に削除しますか？",
      )
    )
      return;

    // 1. ローカルストレージのアカウント配列から、自分(myAppId)を filter で除外
    const updatedList = accountList.filter(
      (acc) => String(acc.id) !== String(myAppId),
    );
    setAccountList(updatedList);
    localStorage.setItem(
      "fleamarket_authenticated_accounts",
      JSON.stringify(updatedList),
    );

    // 2. リストの残存数に応じた条件分岐（数理調停）
    if (updatedList.length > 0) {
      // A. 他にアカウントが残っているなら、先頭のアカウント(updatedList[0])に自動で切り替える
      alert(
        `アカウントを削除しました。残っている「${updatedList[0].name}」のアカウントに自動で切り替えます。`,
      );
      setMyAppId(updatedList[0].id);
    } else {
      // B. 他に誰も残っていないなら、本当のログアウトを実行してログイン画面へ
      handleLogout(false); // 二重アラートを防ぐためサイレント化
    }
  };

  const handleRemoveAccountFromCache = (e, targetId) => {
    e.stopPropagation();
    if (!window.confirm("このアカウントのログイン情報を削除しますか？")) return;

    const updatedList = accountList.filter((acc) => acc.id !== targetId);
    setAccountList(updatedList);
    localStorage.setItem(
      "fleamarket_authenticated_accounts",
      JSON.stringify(updatedList),
    );

    if (String(myAppId) === String(targetId)) {
      handleLogout();
    }
  };

  const currentActiveAccount = accountList.find(
    (acc) => String(acc.id) === String(myAppId),
  ) || {
    name: loginUser?.email ? loginUser.email.split("@")[0] : "ゲストユーザー",
    email: loginUser?.email || "",
  };

  const handleJumpToTransaction = (txId) => {
    setActiveTransactionId(txId);
    setCurrentTab("transaction");
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      {/* メインタイトル見出し */}
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
        <User size={20} color="#333" />
        <span>マイページ</span>
      </h2>

      {/* プロフィールカード */}
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
          {currentActiveAccount.email
            ? currentActiveAccount.email[0].toUpperCase()
            : "U"}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
            {currentActiveAccount.name}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
            会員ID: 0000{myAppId}
          </div>
        </div>
      </div>

      {/* 進行中の取引レーン */}
      {activeTransactions.length > 0 && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Truck size={16} color="#d97706" />
            <span>進行中の取引（発送・メッセージ手続き）</span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {activeTransactions.map((tx) => (
              <div
                key={tx.transaction_id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #fef3c7",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <img
                  src={tx.item_image_url}
                  alt=""
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "6px",
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    {tx.item_name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9a3412",
                      marginTop: "2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>状態:</span>
                    {tx.transaction_status === "shipping_pending" ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          color: "#b45309",
                        }}
                      >
                        <Clock size={12} />
                        <span>発送待ち</span>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          color: "#d97706",
                        }}
                      >
                        <Truck size={12} />
                        <span>発送済み・受取評価待ち</span>
                      </div>
                    )}
                    <span>
                      {String(myAppId) === String(tx.seller_id)
                        ? " (出品者)"
                        : " (購入者)"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleJumpToTransaction(tx.transaction_id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#d97706",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  取引画面へ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アカウント切り替えマルチセンター */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "900",
            color: "#4f46e5",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Users size={16} color="#4f46e5" />
          <span>アカウントの切り替え</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {accountList.map((acc) => {
            const isCurrent = String(acc.id) === String(myAppId);
            return (
              <div
                key={acc.id}
                style={{
                  backgroundColor: isCurrent ? "#eff6ff" : "white",
                  border: isCurrent ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#1e293b",
                      }}
                    >
                      {acc.name}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          backgroundColor: "#3b82f6",
                          color: "white",
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        現在アクティブ
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    ID: 0000{acc.id} • {acc.email}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {!isCurrent ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => setMyAppId(acc.id)}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        切り替える
                      </button>
                      <button
                        onClick={(e) => handleRemoveAccountFromCache(e, acc.id)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "transparent",
                          color: "#94a3b8",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={14} color="#94a3b8" />{" "}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleActiveAccountLogout}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "white",
                        color: "#ef4444",
                        border: "1px solid #fca5a5",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      完全にログアウト
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={handleAddAccount}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "white",
            color: "#4f46e5",
            border: "2px dashed #c7d2fe",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Plus size={16} />
          <span>別のアカウントで新規ログイン（リストに追加）</span>
        </button>
      </div>

      {/* AIウィッシュリスト */}
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
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            color: "#6d28d9",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Target size={16} color="#6d28d9" />
          <span>あなたのAI入荷待ちウィッシュリスト</span>
        </div>

        {/* 過去に登録したキーワード一覧 */}
        <div>
          {wishlists.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {wishlists.map((wish) => (
                <div
                  key={wish.id}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #dbeafe",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#1e3a8a",
                      }}
                    >
                      {wish.keywords}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteWishlist(wish.id, wish.keywords)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#93c5fd",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.color = "#ef4444")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = "#93c5fd")
                    }
                    title="入荷待ちを解除"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: "12px",
                color: "#a78bfa",
                fontStyle: "italic",
                padding: "4px 0",
              }}
            >
              現在、登録中の入荷待ちイメージはありません。
            </div>
          )}
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
              fontSize: "13px",
              fontWeight: "bold",
              color: "#7c3aed",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={14} color="#7c3aed" /> {/* 💡 ✨をSparklesへ */}
            <span>新しい欲しいイメージを追加したいですか？</span>
          </div>
          <form
            onSubmit={handleAddWishlistFromMyPage}
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

      {/* 通常の商品履歴レーン */}
      {isLoading ? (
        <div
          style={{
            textAlign: "center",
            color: "#9ca3af",
            padding: "40px 0",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Loader2 size={16} className="animate-spin" />{" "}
          <span>取引履歴を読み込み中...</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          <div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#111827",
                margin: "0 0 10px 0",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ShoppingBag size={16} color="#111827" />{" "}
              <span>購入した商品 ({purchasedItems.length})</span>
            </h3>
            <HorizontalItemList
              items={purchasedItems}
              handlePurchaseItem={handlePurchaseItem}
              handleCardClick={handleCardClick}
            />
          </div>
          <div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#111827",
                margin: "0 0 10px 0",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Camera size={16} color="#111827" />
              <span>出品した商品 ({myProducts.length})</span>
            </h3>
            <HorizontalItemList
              items={myProducts}
              handlePurchaseItem={handlePurchaseItem}
              handleCardClick={handleCardClick}
            />
          </div>
        </div>
      )}

      {/* 過去の取引履歴アーカイブ */}
      {completedTransactions.length > 0 && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Flag size={16} color="#475569" />
            <span>過去の取引履歴（完了済みのメッセージ・詳細確認）</span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {completedTransactions.map((tx) => (
              <div
                key={tx.transaction_id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <img
                  src={tx.item_image_url}
                  alt=""
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "6px",
                    objectFit: "cover",
                    filter: "grayscale(30%)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    {tx.item_name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCircle2 size={12} color="#64748b" />{" "}
                    <span>取引完了</span>
                    <span>
                      {String(myAppId) === String(tx.seller_id)
                        ? " (元出品者)"
                        : " (元購入者)"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleJumpToTransaction(tx.transaction_id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#64748b",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ログを見る
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPageTab;
