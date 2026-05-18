import React, { useState } from "react";

function ItemForm({ API_URL, sellerId, onSuccess }) {
  // フォーム専用のローカル状態
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleCreateItem = (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert("商品名と価格は必須です！");
      return;
    }

    const newItem = {
      name: name,
      description: description,
      price: parseInt(price),
      image_url: "https://example.com/images/default.jpg",
      seller_id: sellerId,
    };

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("🎉 商品の出品に成功しました！");
          setName("");
          setDescription("");
          setPrice("");
          onSuccess();
        }
      })
      .catch((error) => console.error("エラー:", error));
  };

  return (
    <section
      style={{
        background: "#ffffff", // 🔥 黒から「純白」へ
        padding: "25px",
        borderRadius: "16px", // 角を少し丸くして今風に
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)", // 優しい影
        border: "1px solid #eee",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          borderBottom: "2px solid #ff4d4d", // 🔥 メルカリレッドのアクセント線
          paddingBottom: "10px",
          fontSize: "18px",
          color: "#333333", // 文字を読みやすい濃いグレーに
          fontWeight: "bold",
        }}
      >
        タイムラインに出品する
      </h2>
      <form
        onSubmit={handleCreateItem}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
          }}
        >
          <label
            style={{
              fontSize: "14px",
              marginBottom: "5px",
              color: "#555555",
              fontWeight: "500",
            }}
          >
            商品名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 手作りクッキー"
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #dddddd",
              backgroundColor: "#f9fafb", // 入力欄をほんのりグレーにして立体感を出す
              color: "#333333",
              fontSize: "15px",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
          }}
        >
          <label
            style={{
              fontSize: "14px",
              marginBottom: "5px",
              color: "#555555",
              fontWeight: "500",
            }}
          >
            商品の説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例: チョコチップ入りです！"
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #dddddd",
              backgroundColor: "#f9fafb",
              color: "#333333",
              minHeight: "80px",
              fontSize: "15px",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
          }}
        >
          <label
            style={{
              fontSize: "14px",
              marginBottom: "5px",
              color: "#555555",
              fontWeight: "500",
            }}
          >
            価格 (円)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="例: 500"
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #dddddd",
              backgroundColor: "#f9fafb",
              color: "#333333",
              fontSize: "15px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: "#ff4d4d", // 🔥 メルカリレッド
            color: "white",
            border: "none",
            padding: "14px",
            borderRadius: "25px", // ボタンを丸っこくして親しみやすく
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "10px",
            boxShadow: "0 4px 12px rgba(255, 77, 77, 0.2)", // ボタンにも華やかな影を
            transition: "all 0.2s",
          }}
        >
          この内容で出品する
        </button>
      </form>
    </section>
  );
}

export default ItemForm;
