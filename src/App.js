import React, { useState, useEffect } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fireAuth } from "./firebase";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import LoginForm from "./components/LoginForm";
import AiRecommendForm from "./components/AiRecommendForm";
import ItemDetailModal from "./components/ItemDetailModal";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import LikesTab from "./components/LikesTab";

function App() {
  const [items, setItems] = useState([]);
  const [loginUser, setLoginUser] = useState(null);
  const [myAppId, setMyAppId] = useState(null);

  // 🧠 AI推薦用の状態（State）
  const [moodText, setMoodText] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendMode, setRecommendMode] = useState("both");

  // 🗺️ 画面遷移・モーダル・履歴用の状態（State）
  const [currentTab, setCurrentTab] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibleCount, setVisibleCount] = useState(40);
  const [userLikes, setUserLikes] = useState([]);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // --- 1. ログイン状態の監視 ＆ バックエンド連動 ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, (user) => {
      if (user) {
        setLoginUser(user);
        const dummyName = user.displayName || user.email.split("@")[0];

        fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firebase_uid: user.uid,
            name: dummyName,
            email: user.email,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") {
              setMyAppId(data.id);
              fetchUserLikes(data.id);
            }
          })
          .catch((err) => console.error("ユーザー照合エラー:", err));
      } else {
        setLoginUser(null);
        setMyAppId(null);
        setUserLikes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- 2. 商品一覧を取得する関数 ---
  const fetchItems = () => {
    fetch(`${API_URL}/items`)
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error("データの取得に失敗しました:", error));
  };

  // ユーザーのいいね一覧をバックエンドから取得する関数
  const fetchUserLikes = (userId) => {
    if (!userId) return;
    fetch(`${API_URL}/users/${userId}/likes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUserLikes(data);
      })
      .catch((err) => console.error("いいね一覧の取得に失敗:", err));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 🧠 履歴重視モード選択時の自動計算トリガー
  useEffect(() => {
    if (recommendMode === "history" && myAppId) {
      handleAiRecommend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendMode]);

  // 🧠 --- 2.5 AI推薦シミュレーション関数 ---
  const handleAiRecommend = () => {
    if (recommendMode !== "history" && !moodText.trim()) return;
    setIsRecommending(true);

    fetch(`${API_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: myAppId,
        mood_text: moodText,
        mode: recommendMode,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          alert("推薦データの取得に失敗しました。");
        }
      })
      .catch((error) => {
        console.error("AI推薦エラー:", error);
        alert("推薦計算中にエラーが発生しました。");
      })
      .finally(() => {
        setIsRecommending(false);
      });
  };

  // 🧹 AI推薦をリセット
  const handleResetRecommend = () => {
    setMoodText("");
    setRecommendMode("both");
    setVisibleCount(40);
    fetchItems();
  };

  // --- 3. 購入処理 ---
  const handlePurchaseItem = (itemId) => {
    if (!myAppId) {
      alert("ログインが必要です！");
      return;
    }
    if (!window.confirm("この商品を購入しますか？")) return;

    fetch(`${API_URL}/items/${itemId}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyer_id: myAppId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("ご購入ありがとうございました！");
          setSelectedItem(null);
          fetchItems();
          fetchUserLikes(myAppId);
        } else {
          alert("購入に失敗しました。");
        }
      })
      .catch((error) => {
        console.error("購入エラー:", error);
        alert("通信エラーが発生しました。");
      });
  };

  const handleLogout = () => {
    signOut(fireAuth)
      .then(() => alert("ログアウトしました！"))
      .catch((err) => alert(err.message));
  };

  const handleCardClick = (e, listSource) => {
    if (e.target.tagName === "BUTTON") return;
    const card =
      e.target.closest(".item-card") ||
      e.target.closest("div[style*='border']");
    if (card) {
      const itemName = card.querySelector("h3")?.innerText;
      const matchItem = listSource.find((i) => i.name === itemName);
      if (matchItem) setSelectedItem(matchItem);
    }
  };

  return (
    <div
      className="App"
      style={{ backgroundColor: "#f5f6f8", minHeight: "100vh" }}
    >
      <Header
        loginUser={loginUser}
        handleLogout={handleLogout}
        setCurrentTab={setCurrentTab}
      />
      <Navigation
        myAppId={myAppId}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* メインコンテンツエリア */}
      <main
        style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto" }}
      >
        {myAppId ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "35px" }}
          >
            {/* 🏠 【ホームタブ】 */}
            {currentTab === "home" && (
              <>
                <AiRecommendForm
                  moodText={moodText}
                  setMoodText={setMoodText}
                  recommendMode={recommendMode}
                  setRecommendMode={setRecommendMode}
                  isRecommending={isRecommending}
                  handleAiRecommend={handleAiRecommend}
                  handleResetRecommend={handleResetRecommend}
                />
                <div onClick={(e) => handleCardClick(e, items)}>
                  <ItemList
                    items={items.slice(0, visibleCount)}
                    handlePurchaseItem={handlePurchaseItem}
                  />
                </div>
                {items.length > visibleCount && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "20px",
                      marginBottom: "40px",
                    }}
                  >
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 40)}
                      style={{
                        padding: "12px 30px",
                        backgroundColor: "white",
                        color: "#ff4d4d",
                        border: "2px solid #ff4d4d",
                        borderRadius: "25px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      👇 さらに商品を表示する (Load More)
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ❤️ 【いいね一覧タブ】 */}
            {currentTab === "likes" && (
              <LikesTab
                userLikes={userLikes}
                handleCardClick={handleCardClick}
                handlePurchaseItem={handlePurchaseItem}
              />
            )}

            {/* 📸 【出品タブ】 */}
            {currentTab === "sell" && (
              <ItemForm
                API_URL={`${API_URL}/items`}
                sellerId={myAppId}
                onSuccess={() => {
                  alert("出品が完了しました！");
                  fetchItems();
                  setCurrentTab("home");
                }}
              />
            )}
          </div>
        ) : (
          <LoginForm />
        )}
      </main>

      <ItemDetailModal
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        handlePurchaseItem={handlePurchaseItem}
        myAppId={myAppId}
        userLikes={userLikes}
        onLikeToggle={() => fetchUserLikes(myAppId)}
      />
    </div>
  );
}

export default App;
