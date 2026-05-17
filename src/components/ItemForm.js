import React, { useState } from "react";

function ItemForm({ API_URL, onSuccess }) {
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
      seller_id: 1,
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
          onSuccess(); // 親（App.js）のfetchItemsを呼び出してリストを更新
        }
      })
      .catch((error) => console.error("エラー:", error));
  };

  return (
    <section
      style={{
        background: "#2d3748",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          borderBottom: "2px solid #61dafb",
          paddingBottom: "10px",
          fontSize: "20px",
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
            style={{ fontSize: "14px", marginBottom: "5px", color: "#cbd5e0" }}
          >
            商品名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 手作りクッキー"
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#4a5568",
              color: "white",
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
            style={{ fontSize: "14px", marginBottom: "5px", color: "#cbd5e0" }}
          >
            商品の説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例: チョコチップ入りです！"
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#4a5568",
              color: "white",
              minHeight: "60px",
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
            style={{ fontSize: "14px", marginBottom: "5px", color: "#cbd5e0" }}
          >
            価格 (円)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="例: 500"
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#4a5568",
              color: "white",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: "#61dafb",
            color: "#1e222b",
            border: "none",
            padding: "12px",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          この内容で出品する
        </button>
      </form>
    </section>
  );
}

export default ItemForm;
