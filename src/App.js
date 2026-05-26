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
import HomeTab from "./components/HomeTab";
import TransactionTab from "./components/TransactionTab";

function App() {
  // 🔍 検索タブ用のアイテム（Ask AIの結果用）
  const [homeItems, setHomeItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  // 🏠 【ホーム用】3段パーソナライズ専用のState
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
  const [activeTransactionId, setActiveTransactionId] = useState(null);
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

  // 💡 新設したパーソナライズAPIを叩いて3段分のデータを一気に取得！
  const fetchHomeRecommendations = (userId) => {
    if (!userId) return;
    setIsRecommending(true);

    fetch(`${API_URL}/home/${userId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success" && json.data) {
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

  // 💡 ホーム画面からの直接検索を受け付けるため、明示的な引数（explicitText）に対応
  const handleAiRecommend = (explicitText) => {
    const targetText =
      typeof explicitText === "string" ? explicitText : moodText;

    if (!targetText.trim()) return;
    setIsRecommending(true);

    fetch(`${API_URL}/users/${myAppId}/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: targetText }),
    }).catch((err) => console.error("キーワード保存エラー:", err));

    fetch(`${API_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: myAppId,
        mood_text: targetText,
        filter_status: "both", // 😎 【修正】選択状態に関わらず、常に売切を含む「both」で500件まるごとハント！
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHomeItems(data);
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

  // 💡 ホーム画面の検索バーから呼び出される中継・高速遷移ロケット関数
  const handleHomeSearch = (keyword) => {
    setMoodText(keyword); // 1. 検索タブの入力テキストを同期
    setCurrentTab("search"); // 2. 検索タブへ自動で切り替え
    handleAiRecommend(keyword); // 3. State反映を待たずに、引数の文字で直接AI推薦を駆動！
    window.scrollTo(0, 0);
  };

  // 💡 履歴タブの過去キーワードから呼ばれる「セット＆ジャンプ」中継関数（自動検索は非発火）
  const handleKeywordClick = (keyword) => {
    setMoodText(keyword); // 1. 検索タブのテキストボックスに文字列を同期
    setCurrentTab("search"); // 2. 検索タブに画面をスライド切り替え
    window.scrollTo(0, 0);
  };

  const handleResetRecommend = () => {
    setMoodText("");
    setFilterStatus("both");
    setHomeItems([]);
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
          // 💡 演出を変更：取引セッションの開始をユーザーにアナウンス
          alert("商品の購入が完了しました！取引画面へ遷移します。");
          setSelectedItem(null);
          fetchAllItems();
          fetchHomeRecommendations(myAppId);
          fetchUserLikes(myAppId);

          setActiveTransactionId(data.transaction_id);
          setCurrentTab("transaction");
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

  return (
    <div
      className="App"
      style={{ backgroundColor: "#f5f6f8", minHeight: "100vh" }}
    >
      <Header
        loginUser={loginUser}
        handleLogout={handleLogout}
        setCurrentTab={setCurrentTab}
        myAppId={myAppId}
        setActiveTransactionId={setActiveTransactionId}
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
            {currentTab === "home" && (
              <HomeTab
                homePersonalized={homePersonalized}
                homeUserFavorite={homeUserFavorite}
                homeMarketFavorite={homeMarketFavorite}
                handleCardClick={handleCardClick}
                handlePurchaseItem={handlePurchaseItem}
                onHomeSearch={handleHomeSearch}
                setCurrentTab={setCurrentTab}
              />
            )}

            {/* ✨ 【おすすめ・履歴タブ】 */}
            {currentTab === "history" && (
              <HistoryTab
                myAppId={myAppId}
                userLikes={userLikes}
                handleCardClick={handleCardClick}
                handlePurchaseItem={handlePurchaseItem}
                onKeywordClick={handleKeywordClick}
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
                setMyAppId={setMyAppId}
                handleLogout={handleLogout}
                setActiveTransactionId={setActiveTransactionId}
                setCurrentTab={setCurrentTab}
              />
            )}

            {/* 🚚 【新設：取引画面タブ】分岐条件をここに滑り込ませます */}
            {currentTab === "transaction" && (
              <TransactionTab
                transactionId={activeTransactionId}
                myAppId={myAppId}
                setCurrentTab={setCurrentTab}
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
