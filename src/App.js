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
import HistoryTab from "./components/HistoryTab";
import SearchTab from "./components/SearchTab";
import MyPageTab from "./components/MyPageTab";

function App() {
  const [homeItems, setHomeItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  const [loginUser, setLoginUser] = useState(null);
  const [myAppId, setMyAppId] = useState(null);

  // 🧠 AI推薦用の状態（State）
  const [moodText, setMoodText] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendMode, setRecommendMode] = useState("both");
  const [filterStatus, setFilterStatus] = useState("both"); // 🆕 フィルター用のStateを新設

  // 🗺️ 画面遷移・モーダル・履歴用の状態（State）
  const [currentTab, setCurrentTab] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
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

  const fetchAllItems = () => {
    fetch(`${API_URL}/items`)
      .then((response) => response.json())
      .then((data) => setAllItems(data))
      .catch((error) => console.error("全件データの取得に失敗:", error));
  };

  const fetchHomeRecommendations = (userId) => {
    if (!userId) return;
    setIsRecommending(true);
    fetch(`${API_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        mood_text: moodText,
        mode: recommendMode,
        filter_status: filterStatus, // 🆕 新条件をブレンドして送信
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHomeItems(data);
      })
      .catch((err) => console.error("初期AI推薦エラー:", err))
      .finally(() => setIsRecommending(false));
  };

  // ログインユーザー確定、またはラジオボタン切り替え時に自動で再レコメンドを走らせる数理配線
  useEffect(() => {
    if (myAppId) {
      fetchAllItems();
      fetchHomeRecommendations(myAppId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAppId, filterStatus, recommendMode]);

  const fetchUserLikes = (userId) => {
    if (!userId) return;
    fetch(`${API_URL}/users/${userId}/likes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUserLikes(data);
      })
      .catch((err) => console.error("いいね一覧の取得に失敗:", err));
  };

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
        filter_status: filterStatus, // 🆕 ボタンを押した時も送信
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHomeItems(data);
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

  const handleResetRecommend = () => {
    setMoodText("");
    setRecommendMode("both");
    setFilterStatus("both"); // 🆕 リセット
    setVisibleCount(20);
    fetchHomeRecommendations(myAppId);
  };

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
          fetchAllItems();
          fetchHomeRecommendations(myAppId);
          fetchUserLikes(myAppId);
          if (currentTab === "mypage") setCurrentTab("home");
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
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus} // 🆕 フィルター状態を配線
                />

                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    margin: "10px 0 -10px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ✨{" "}
                  <span className="ai-heading-text">
                    あなたへのおすすめ商品 (AIパーソナライズ)
                  </span>
                </h3>

                <div onClick={(e) => handleCardClick(e, homeItems)}>
                  <ItemList
                    items={homeItems.slice(0, visibleCount)}
                    handlePurchaseItem={handlePurchaseItem}
                  />
                </div>

                {homeItems.length > visibleCount && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "20px",
                      marginBottom: "40px",
                    }}
                  >
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 20)}
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

            {/* 🆕 【履歴タブ】（横スクロールの3段構え） */}
            {currentTab === "history" && (
              <HistoryTab
                myAppId={myAppId}
                userLikes={userLikes}
                handleCardClick={handleCardClick}
                handlePurchaseItem={handlePurchaseItem}
              />
            )}

            {/* 🔍 【検索タブ】 */}
            {currentTab === "search" && (
              <SearchTab
                items={allItems}
                handleCardClick={handleCardClick}
                handlePurchaseItem={handlePurchaseItem}
              />
            )}

            {/* 👤 【マイページタブ】 */}
            {currentTab === "mypage" && (
              <MyPageTab
                myAppId={myAppId}
                loginUser={loginUser}
                handleCardClick={handleCardClick}
                handlePurchaseItem={handlePurchaseItem}
              />
            )}

            {/* 📸 【出品タブ】 */}
            {currentTab === "sell" && (
              <ItemForm
                sellerId={myAppId}
                onSuccess={() => {
                  alert("出品が完了しました！");
                  fetchAllItems();
                  fetchHomeRecommendations(myAppId);
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
