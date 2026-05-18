import React, { useState, useEffect } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fireAuth } from "./firebase";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import LoginForm from "./components/LoginForm"; // 👈 追加

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

        // メール認証の場合、初期の名前はメールの@の前の文字列を仮として使用します
        const dummyName = user.displayName || user.email.split("@")[0];

        // 💡 ログイン成功したら、バックエンドにUIDを送ってMySQLの整数IDを照合・取得する
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
              setMyAppId(data.id); // 🌟 MySQLの整数IDを状態に保存！
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

  // --- 3. 購入処理（ログイン中の自分のIDをバックエンドに送る） ---
  const handlePurchaseItem = (itemId) => {
    if (!myAppId) {
      alert("ログインが必要です！");
      return;
    }
    if (!window.confirm("この商品を購入しますか？")) return;

    fetch(`${API_URL}/items/${itemId}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyer_id: myAppId }), // 🌟 1固定だったのをログインユーザーのIDに変更！
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
    <div className="App">
      <header
        className="App-header"
        style={{
          backgroundColor: "#1e222b",
          minHeight: "100vh",
          color: "white",
          padding: "40px 20px",
        }}
      >
        {/* 🚪 ログインしている時だけログアウトボタンを右上に表示 */}
        {loginUser && (
          <div
            style={{
              textAlign: "right",
              maxWidth: "600px",
              margin: "0 auto 20px auto",
              fontSize: "14px",
            }}
          >
            <span>👤 {loginUser.email} でログイン中 </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                backgroundColor: "#e53e3e",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginLeft: "10px",
                fontWeight: "bold",
              }}
            >
              ログアウト
            </button>
          </div>
        )}

        <h1
          style={{
            color: "#61dafb",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          フリマアプリ
        </h1>

        <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
          {myAppId ? (
            // 🌟 ログインに成功し、MySQLのIDが取れたらメインのフリマ画面を出す
            <div
              style={{ display: "flex", flexDirection: "column", gap: "40px" }}
            >
              <ItemForm
                API_URL={`${API_URL}/items`}
                sellerId={myAppId}
                onSuccess={fetchItems}
              />
              <ItemList items={items} handlePurchaseItem={handlePurchaseItem} />
            </div>
          ) : (
            // 🔒 ログインしていない時は、ログイン/新規登録フォームだけを見せる（認可制御）
            <LoginForm />
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
