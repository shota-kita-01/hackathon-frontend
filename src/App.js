import React, { useState, useEffect } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fireAuth } from "./firebase";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import LoginForm from "./components/LoginForm";

function App() {
  const [items, setItems] = useState([]);
  const [loginUser, setLoginUser] = useState(null); // Firebaseのログイン状態
  const [myAppId, setMyAppId] = useState(null); // MySQL側の整数ID（1とか2とか）

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
            }
          })
          .catch((err) => console.error("ユーザー照合エラー:", err));
      } else {
        setLoginUser(null);
        setMyAppId(null);
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

  useEffect(() => {
    fetchItems();
  }, []);

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
          fetchItems();
        } else {
          alert("購入に失敗しました。");
        }
      })
      .catch((error) => {
        console.error("購入エラー:", error);
        alert("通信エラーが発生しました。");
      });
  };

  // --- 4. ログアウト処理 ---
  const handleLogout = () => {
    signOut(fireAuth)
      .then(() => alert("ログアウトしました！"))
      .catch((err) => alert(err.message));
  };

  return (
    <div
      className="App"
      style={{ backgroundColor: "#f5f6f8", minHeight: "100vh" }}
    >
      {/* 🚪 ヘッダーエリア（白ベースにシャドウで今風に） */}
      <header
        style={{
          backgroundColor: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          padding: "15px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            color: "#ff4d4d", // 🔥 メルカリ風の鮮やかなレッド
            margin: 0,
            fontSize: "24px",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          フリマアプリ
        </h1>

        {loginUser && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              fontSize: "14px",
              color: "#333",
            }}
          >
            <span style={{ fontWeight: "500" }}>👤 {loginUser.email}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                backgroundColor: "#f5f6f8",
                color: "#666",
                border: "1px solid #ddd",
                borderRadius: "20px", // 丸っこく親しみやすいデザインに
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                transition: "all 0.2s",
              }}
            >
              ログアウト
            </button>
          </div>
        )}
      </header>

      {/* メインコンテンツエリア */}
      <main
        style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto" }}
      >
        {myAppId ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "35px" }}
          >
            <ItemForm
              API_URL={`${API_URL}/items`}
              sellerId={myAppId}
              onSuccess={fetchItems}
            />
            <ItemList items={items} handlePurchaseItem={handlePurchaseItem} />
          </div>
        ) : (
          <LoginForm />
        )}
      </main>
    </div>
  );
}

export default App;
