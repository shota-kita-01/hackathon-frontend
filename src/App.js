import React, { useState, useEffect } from "react";
import "./App.css";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";

function App() {
  const [items, setItems] = useState([]);
  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api/items";

  // --- 1. 商品一覧を取得する関数 ---
  const fetchItems = () => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error("データの取得に失敗しました:", error));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --- 2. 購入処理 ---
  const handlePurchaseItem = (itemId) => {
    if (!window.confirm("この商品を購入しますか？")) return;

    fetch(`${API_URL}/${itemId}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyer_id: 1 }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("ご購入ありがとうございました！");
          fetchItems(); // 購入成功後にリストを再読込
        } else {
          alert("購入に失敗しました。");
        }
      })
      .catch((error) => {
        console.error("購入エラー:", error);
        alert("通信エラーが発生しました。");
      });
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
        <h1
          style={{
            color: "#61dafb",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          フリマアプリ
        </h1>

        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "40px",
          }}
        >
          {/* 切り出した出品フォーム部品 */}
          <ItemForm API_URL={API_URL} onSuccess={fetchItems} />

          {/* 切り出したタイムライン一覧部品 */}
          <ItemList items={items} handlePurchaseItem={handlePurchaseItem} />
        </div>
      </header>
    </div>
  );
}

export default App;
