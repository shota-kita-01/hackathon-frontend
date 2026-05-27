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
  const [homeItems, setHomeItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

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

  const [moodText, setMoodText] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendMode, setRecommendMode] = useState("both");
  const [filterStatus, setFilterStatus] = useState("both");

  const [currentTab, setCurrentTab] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [userLikes, setUserLikes] = useState([]);
  const [activeTransactionId, setActiveTransactionId] = useState(null);

  // 📝 【新設】現在「訂正（編集）モード」に入っている商品の情報を保持するState
  const [editingItem, setEditingItem] = useState(null);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

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
        filter_status: "both",
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

  const handleHomeSearch = (keyword) => {
    setMoodText(keyword);
    setCurrentTab("search");
    handleAiRecommend(keyword);
    window.scrollTo(0, 0);
  };

  const handleKeywordClick = (keyword) => {
    setMoodText(keyword);
    setCurrentTab("search");
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

  const handleNegotiationSuccess = (transactionId) => {
    setSelectedItem(null);
    fetchAllItems();
    fetchHomeRecommendations(myAppId);
    fetchUserLikes(myAppId);

    setActiveTransactionId(transactionId);
    setCurrentTab("transaction");
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

            {currentTab === "history" && (
              <HistoryTab
                myAppId={myAppId}
                userLikes={userLikes}
                handleCardClick={handleCardClick}
                handlePurchaseItem={handlePurchaseItem}
                onKeywordClick={handleKeywordClick}
              />
            )}

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

            {currentTab === "transaction" && (
              <TransactionTab
                transactionId={activeTransactionId}
                myAppId={myAppId}
                setCurrentTab={setCurrentTab}
              />
            )}

            {currentTab === "sell" && (
              <ItemForm
                sellerId={myAppId}
                editingItem={editingItem} // 💡 編集対象の商品を渡す
                onSuccess={() => {
                  alert(
                    editingItem
                      ? "商品の更新が完了しました！"
                      : "出品が完了しました！",
                  );
                  setEditingItem(null); // 💡 編集が終わったら状態をクリア
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
        onNegotiationSuccess={handleNegotiationSuccess}
        setEditingItem={setEditingItem} // 💡 モーダルに編集用関数を渡す
        setCurrentTab={setCurrentTab} // 💡 タブ切り替え関数を渡す
      />
    </div>
  );
}

export default App;
