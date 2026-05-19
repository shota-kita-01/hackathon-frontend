import React, { useState } from "react";

function ItemForm({ sellerId, onSuccess }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState(""); // 🆕 タグ用の状態（State）

  // 🧠 AI処理中のローディング状態
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);

  const BASE_API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // 🧠 【機能4】AI自動商品説明生成を呼び出す関数
  const handleSuggestDescription = () => {
    if (!name.trim()) {
      alert("商品名を入力してからAIアシストを叩いてください！");
      return;
    }
    setIsGeneratingDesc(true);

    fetch(`${BASE_API_URL}/ai/suggest-description`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setDescription(data.description);
        } else {
          alert("商品説明の生成に失敗しました。");
        }
      })
      .catch((err) => console.error("AI商品説明エラー:", err))
      .finally(() => setIsGeneratingDesc(false));
  };

  // 🧠 【機能5】AI価格査定を呼び出す関数
  const handleSuggestPrice = () => {
    if (!name.trim()) {
      alert("商品名を入力してからAI価格査定を叩いてください！");
      return;
    }
    setIsEstimatingPrice(true);

    fetch(`${BASE_API_URL}/ai/suggest-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPrice(data.suggested_price);
        } else {
          alert("価格査定に失敗しました。");
        }
      })
      .catch((err) => console.error("AI価格査定エラー:", err))
      .finally(() => setIsEstimatingPrice(false));
  };

  // 出品処理の確定
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !description || !price) {
      alert("必須項目が入力されていません！");
      return;
    }

    const finalImageUrl =
      imageUrl.trim() ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop";

    fetch(`${BASE_API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        description: description,
        price: parseInt(price),
        image_url: finalImageUrl,
        seller_id: sellerId,
        tags: tags, // 🆕 タグをカンマ区切りの文字列のままバックエンドへ送信
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          // フォームを綺麗に初期化
          setName("");
          setDescription("");
          setPrice("");
          setImageUrl("");
          setTags("");
          onSuccess(); // App.js側のリロード処理などをキック
        } else {
          alert("出品に失敗しました: " + data.message);
        }
      })
      .catch((error) => {
        console.error("出品エラー:", error);
        alert("通信エラーが発生しました。");
      });
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
          margin: "0 0 20px 0",
        }}
      >
        📸 商品を出品する
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {/* 商品名入力 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            商品名 <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="商品名を入力（例: Nike Dunk Low Retro Black White）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* 🧠 🆕 【AIマジックボタンエリア】 */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={handleSuggestDescription}
            disabled={isGeneratingDesc}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#f3e8ff",
              color: "#6b21a8",
              border: "1px solid #c084fc",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {isGeneratingDesc ? "⏳ AI執筆中..." : "🧠 AI自動商品説明"}
          </button>
          <button
            type="button"
            onClick={handleSuggestPrice}
            disabled={isEstimatingPrice}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #34d399",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {isEstimatingPrice ? "⏳ 査定中..." : "💰 AI適正価格査定"}
          </button>
        </div>

        {/* 商品説明 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            商品説明 <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <textarea
            placeholder="商品の詳細な説明文（AIボタンで世界基準の英語説明を自動生成できます）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* 価格入力 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            販売価格 (円) <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <input
            type="number"
            placeholder="金額を入力（AI査定ボタンで相場を自動入力できます）"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* 🆕 タグ入力 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            タグ（検索用キーワード）
          </label>
          <input
            type="text"
            placeholder="カンマ区切りで入力（例: sneaker, nike, vintage）"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* 画像URL入力 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            商品画像URL
          </label>
          <input
            type="text"
            placeholder="空欄の場合はスタイリッシュなデフォルト画像がセットされます"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* 出品ボタン */}
        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "12px",
            backgroundColor: "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          🚀 この内容でタイムラインに出品する
        </button>
      </form>
    </div>
  );
}

export default ItemForm;
