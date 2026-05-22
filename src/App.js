import React, { useState, useEffect } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fireAuth } from "./firebase";
import ItemForm from "./components/ItemForm";
import LoginForm from "./components/LoginForm";
import ItemDetailModal from "./components/ItemDetailModal";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import HistoryTab from "./components/HistoryTab";
import SearchTab from "./components/SearchTab";
import MyPageTab from "./components/MyPageTab";
import HorizontalItemList from "./components/HorizontalItemList";

function App() {
  // 🔍 検索タブ用のアイテム（Ask AIの結果用）
  const [homeItems, setHomeItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  // 🏠 【ホーム用】3段パーソナライズ専用のState（🆕 新設）
  const [homePersonalized, setHomePersonalized] = useState([]);
  const [homeUserFavorite, setHomeUserFavorite] = useState({
    title: "",
    items: [],
  });
  const [homeMarketFavorite, setHomeMarketFavorite] = useState({
    title: "",
    items: [],
  });

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

  // 💡 【超重要】新設したパーソナライズAPIを叩いて3段分のデータを一気に取得！
  const fetchHomeRecommendations = (userId) => {
    if (!userId) return;
    setIsRecommending(true);

    fetch(`${API_URL}/home/${userId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success" && json.data) {
          // バックエンドが計算した3種類のデータをそれぞれのStateへ格納
          setHomePersonalized(json.data.personalized.items);
          setHomeUserFavorite(json.data.user_favorite);
          setHomeMarketFavorite(json.data.market_favorite);
        }
      })
      .catch((err) =>
        console.error("ホームパーソナライズデータ取得エラー:", err),
      )
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
    if (!moodText.trim()) return;
    setIsRecommending(true);

    fetch(`${API_URL}/users/${myAppId}/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: moodText }),
    }).catch((err) => console.error("キーワード保存エラー:", err));

    fetch(`${API_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: myAppId,
        mood_text: moodText,
        filter_status: filterStatus,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHomeItems(data); // 検索タブ用（Ask AI結果）にセット
        } else if (data.status === "success" && Array.isArray(data.data)) {
          setHomeItems(data.data);
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
    setFilterStatus("both");
    setHomeItems([]); // 検索結果をリセット
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
          fetchHomeRecommendations(myAppId); // 購買によってパーソナライズを再計算！
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

  // 🥇 1段目（あなたへのおすすめ）の表示用切り分け
  const firstHeroItem = homePersonalized[0];
  const remainingScrollItems = homePersonalized.slice(1);

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
            {/* 🏠 【新・ホームタブ：3段パーソナライズUI】 */}
            {currentTab === "home" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "45px",
                }}
              >
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
                      👑{" "}
                      <span className="ai-heading-text">
                        あなたへのおすすめ
                      </span>
                    </h3>

                    {/* 1件目の特製ビッグカード */}
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
                            👤 {firstHeroItem.seller_name || "公式出品"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 残りの4件を横スクロールで流す */}
                    {remainingScrollItems.length > 0 && (
                      <HorizontalItemList
                        items={remainingScrollItems}
                        handlePurchaseItem={handlePurchaseItem}
                        handleCardClick={handleCardClick}
                      />
                    )}
                  </div>
                )}

                {/* 🥈 2段目：あなたに人気のカテゴリー（新規ユーザー向け防弾 placeholder 完備） */}
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

                  {homeUserFavorite.items &&
                  homeUserFavorite.items.length > 0 ? (
                    // 💡 データがある場合は通常通り横スクロールで流す
                    <HorizontalItemList
                      items={homeUserFavorite.items}
                      handlePurchaseItem={handlePurchaseItem}
                      handleCardClick={handleCardClick}
                    />
                  ) : (
                    // 💡 新規ユーザーでデータが0件の場合は、オシャレな点線枠でメッセージを表示！
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
                {homeMarketFavorite.items.length > 0 && (
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
