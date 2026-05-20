import React, { useState, useEffect } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fireAuth } from "./firebase";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import LoginForm from "./components/LoginForm";
import ItemDetailModal from "./components/ItemDetailModal";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import HistoryTab from "./components/HistoryTab";
import SearchTab from "./components/SearchTab";
import MyPageTab from "./components/MyPageTab";
import HorizontalItemList from "./components/HorizontalItemList"; // 🆕 横スクロールコンポーネントをホームでも使うためにインポート！

function App() {
  const [homeItems, setHomeItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  const [loginUser, setLoginUser] = useState(null);
  const [myAppId, setMyAppId] = useState(null);

  // 🧠 AI推薦用の状態（State）
  const [moodText, setMoodText] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendMode, setRecommendMode] = useState("both");
  const [filterStatus, setFilterStatus] = useState("both");

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
        filter_status: filterStatus,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHomeItems(data);
      })
      .catch((err) => console.error("初期AI推薦エラー:", err))
      .finally(() => setIsRecommending(false));
  };

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
        filter_status: filterStatus,
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
    setFilterStatus("both");
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

  const handleCardClick = (param1, param2) => {
    if (param1 && param1.id && !param1.target) {
      setSelectedItem(param1);
      recordItemView(param1.id);
      return;
    }

    const e = param1;
    const listSource = param2;
    if (!e || !listSource) return;
    if (e.target.tagName === "BUTTON") return;

    const card =
      e.target.closest(".item-card") ||
      e.target.closest("div[style*='border']");
    if (card) {
      const itemName = card.querySelector("h3")?.innerText;
      const matchItem = listSource.find((i) => i.name === itemName);
      if (matchItem) {
        setSelectedItem(matchItem);
        recordItemView(matchItem.id);
      }
    }
  };

  const recordItemView = (itemId) => {
    if (!myAppId) return;
    fetch(`${API_URL}/items/${itemId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    }).catch((err) => console.error("閲覧履歴登録エラー:", err));
  };

  // 🆕 配列切り分けの仕込み
  const firstHeroItem = homeItems[0]; // 1番スコアの高いイチオシの1件
  const remainingScrollItems = homeItems.slice(1); // 2件目以降のすべて

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
            {/* 🏠 【ホームタブ：新・ショーケースUI】 */}
            {currentTab === "home" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "35px",
                }}
              >
                {/* 1段目：✨ あなたへの最高のおすすめ商品（1件限定の巨大ヒーローバナー） */}
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
                      👑{" "}
                      <span className="ai-heading-text">
                        あなたへの最高のイチオシ商品
                      </span>
                    </h3>

                    {/* 🆕 1件だけのための特製ビッグカード */}
                    <div
                      className="item-card"
                      onClick={() => handleCardClick(firstHeroItem)}
                      style={{
                        backgroundColor:
                          firstHeroItem.status === "sold_out"
                            ? "#f9fafb"
                            : "white",
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
                      }}
                    >
                      {/* 画像エリア */}
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
                            height: "260px",
                            objectFit: "cover",
                            borderRadius: "14px",
                            display: "block",
                            opacity:
                              firstHeroItem.status === "sold_out" ? 0.4 : 1,
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

                      {/* タイトルと価格 */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: "900",
                            color:
                              firstHeroItem.status === "sold_out"
                                ? "#9ca3af"
                                : "#111827",
                          }}
                        >
                          {firstHeroItem.name}
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "22px",
                              fontWeight: "900",
                              color:
                                firstHeroItem.status === "sold_out"
                                  ? "#9ca3af"
                                  : "#ff4d4d",
                            }}
                          >
                            {firstHeroItem.price.toLocaleString()} 円
                          </span>
                          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                            👤 {firstHeroItem.seller_name || "名無しさん"}
                          </span>
                        </div>
                      </div>

                      {/* AIマッチ度バッジ */}
                      {firstHeroItem.score !== undefined &&
                        firstHeroItem.score > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "16px",
                              right: "16px",
                              backgroundColor: "rgba(79, 70, 229, 0.95)",
                              color: "white",
                              padding: "6px 12px",
                              borderRadius: "10px",
                              fontSize: "11px",
                              fontWeight: "bold",
                              fontFamily: "monospace",
                              backdropFilter: "blur(4px)",
                              boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)",
                            }}
                          >
                            ✨ Match: {(firstHeroItem.score * 100).toFixed(1)}%
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* 1.5段目：✨ 他のおすすめ商品（2件目以降を横スクロールで流す） */}
                {remainingScrollItems.length > 0 && (
                  <div>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: "bold",
                        margin: "0 0 12px 0",
                        color: "#4b5563",
                      }}
                    >
                      👀 こちらの商品もおすすめです
                    </h3>
                    <HorizontalItemList
                      items={remainingScrollItems}
                      handlePurchaseItem={handlePurchaseItem}
                      handleCardClick={handleCardClick}
                    />
                  </div>
                )}

                {/* 2段目：🏷️ あなたのお気に入りカテゴリー（後で実装） */}
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
                    🏷️ あなたのお気に入りカテゴリー
                  </h3>
                  <div
                    style={{
                      padding: "24px",
                      color: "#9ca3af",
                      fontSize: "13px",
                      backgroundColor: "white",
                      borderRadius: "16px",
                      border: "1px dashed #d1d5db",
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    ⚙️
                    AIがあなたの好みのカテゴリを分析中です。実装されるまでお待ちください。
                  </div>
                </div>

                {/* 3段目：🔥 人気のカテゴリ（後で実装） */}
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
                    🔥 トレンド・人気のカテゴリ
                  </h3>
                  <div
                    style={{
                      padding: "24px",
                      color: "#9ca3af",
                      fontSize: "13px",
                      backgroundColor: "white",
                      borderRadius: "16px",
                      border: "1px dashed #d1d5db",
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    📈
                    現在の市場トレンドを集計しています。実装されるまでお待ちください。
                  </div>
                </div>
              </div>
            )}

            {/* ✨ 【おすすめ・履歴タブ】 */}
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
                homeItems={homeItems}
                handleCardClick={handleCardClick}
                handlePurchaseItem={handlePurchaseItem}
                moodText={moodText}
                setMoodText={setMoodText}
                recommendMode={recommendMode}
                setRecommendMode={setRecommendMode}
                isRecommending={isRecommending}
                handleAiRecommend={handleAiRecommend}
                handleResetRecommend={handleResetRecommend}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
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
