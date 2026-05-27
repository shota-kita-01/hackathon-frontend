import React, { useState } from "react";
import {
  AMAZON_CATEGORIES,
  ITEM_CONDITIONS,
  SHIPPING_DAYS_OPTIONS,
  CATEGORY_IMAGE_POOLS,
  ALL_FLAT_IMAGES,
} from "./FormConstants";
import AiNegoFormSection from "./AiNegoFormSection";

function ItemForm({ sellerId, onSuccess }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [itemCondition, setItemCondition] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [shippingDays, setShippingDays] = useState("");
  const [priceError, setPriceError] = useState("");

  // 🥊 AI自動交渉管理用のState
  const [minAcceptablePrice, setMinAcceptablePrice] = useState("");
  const [sellerStance, setSellerStance] = useState("");
  const [minPriceError, setMinPriceError] = useState("");

  const [isAiChecked, setIsAiChecked] = useState(false);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [safetyCheckMessage, setSafetyCheckMessage] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);

  const BASE_API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  const handleTextChange = (type, value) => {
    if (type === "name") setName(value);
    if (type === "description") setDescription(value);
    setIsAiChecked(false);
    setSafetyCheckMessage("");
  };

  const handleSuggestDescription = () => {
    if (!name.trim()) return;
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
          setIsAiChecked(false);
        } else {
          alert("商品説明の生成に失敗しました。");
        }
      })
      .catch((err) => console.error("AI商品説明エラー:", err))
      .finally(() => setIsGeneratingDesc(false));
  };

  const handleSuggestPrice = () => {
    if (!name.trim() || !description.trim() || !tags || !itemCondition) return;
    setIsEstimatingPrice(true);

    fetch(`${BASE_API_URL}/ai/suggest-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        description: description,
        tags: tags,
        item_condition: itemCondition,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPrice(data.suggested_price);
          setPriceError("");

          if (
            sellerStance === "売り切りたい" ||
            sellerStance === "急いでいない"
          ) {
            const autoMin = Math.floor(data.suggested_price * 0.9);
            setMinAcceptablePrice(autoMin);
          }
          setMinPriceError("");
        } else {
          alert(data.detail || "価格査定に失敗しました。");
        }
      })
      .catch((err) => {
        console.error(`AI価格査定エラー: ${err}`);
        alert("通信エラーが発生しました。");
      })
      .finally(() => setIsEstimatingPrice(false));
  };

  const handleAiSafetyCheck = () => {
    if (!name.trim() || !description.trim()) {
      alert("商品名と商品説明を先に入力してください！");
      return;
    }
    setIsCheckingSafety(true);
    setSafetyCheckMessage("");

    fetch(`${BASE_API_URL}/items/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, description: description }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          if (data.is_safe) {
            setIsAiChecked(true);
            setSafetyCheckMessage(
              "✅ AI規約審査クリア！安全な商品と認定されました。✨",
            );
          } else {
            setIsAiChecked(false);
            setSafetyCheckMessage(`❌ 出品制限: ${data.reason}`);
          }
        } else {
          alert(data.message || "AI審査システムとの通信に失敗しました。");
        }
      })
      .catch((err) => {
        console.error("AIモデレーションエラー:", err);
        alert("通信エラーが発生しました。");
      })
      .finally(() => setIsCheckingSafety(false));
  };

  const handlePriceChange = (value) => {
    if (value === "") {
      setPrice("");
      setPriceError("");
      return;
    }
    if (Number(value) < 0) {
      setPriceError("金額に負の数字は入力できません。");
      return;
    }
    if (!/^\d+$/.test(value)) {
      setPriceError("数字を入力してください。");
      return;
    }
    setPrice(value);
    setPriceError("");

    if (
      sellerStance !== "値下げは考えていない" &&
      minAcceptablePrice &&
      Number(minAcceptablePrice) > Number(value)
    ) {
      setMinPriceError("最低許容価格が販売価格を上回っています。");
    } else {
      setMinPriceError("");
    }
  };

  const handleMinPriceChange = (value) => {
    if (value === "") {
      setMinAcceptablePrice("");
      setMinPriceError("");
      return;
    }
    if (Number(value) < 0) {
      setMinPriceError("金額に負の数字は入力できません。");
      return;
    }
    if (price && Number(value) > Number(price)) {
      setMinAcceptablePrice(value);
      setMinPriceError(
        "最低許容価格は、販売価格以下の金額に設定してください。",
      );
      return;
    }
    setMinAcceptablePrice(value);
    setMinPriceError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isAiChecked) {
      alert(
        "出品する前に、必ず「AI規約自動チェック」を実行してクリアしてください！",
      );
      return;
    }

    if (priceError || !price || Number(price) < 0) {
      alert("販売価格に正しい数字を入力してください。");
      return;
    }

    if (sellerStance !== "値下げは考えていない" && minPriceError) {
      alert("最低許容価格の設定に数理的なエラーがあります。修正してください。");
      return;
    }

    if (
      !name ||
      !description ||
      !tags ||
      !itemCondition ||
      !sellerName ||
      !shippingDays ||
      !sellerStance
    ) {
      alert("未入力、または未選択の必須項目があります！");
      return;
    }

    let finalImageUrl = imageUrl.trim();
    if (!finalImageUrl) {
      const targetPool = CATEGORY_IMAGE_POOLS[tags] || ALL_FLAT_IMAGES;
      const randomIndex = Math.floor(Math.random() * targetPool.length);
      finalImageUrl = targetPool[randomIndex];
    }

    const finalMinPrice =
      sellerStance === "値下げは考えていない"
        ? parseInt(price, 10)
        : minAcceptablePrice
          ? parseInt(minAcceptablePrice, 10)
          : parseInt(price, 10);

    fetch(`${BASE_API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        description: description,
        price: parseInt(price, 10),
        min_acceptable_price: finalMinPrice,
        seller_stance: sellerStance,
        image_url: finalImageUrl,
        seller_id: sellerId,
        tags: tags,
        item_condition: itemCondition,
        seller_nickname: sellerName,
        shipping_days: shippingDays,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setName("");
          setDescription("");
          setPrice("");
          setMinAcceptablePrice("");
          setSellerStance("");
          setImageUrl("");
          setTags("");
          setItemCondition("");
          setSellerName("");
          setShippingDays("");
          setPriceError("");
          setMinPriceError("");
          setIsAiChecked(false);
          setSafetyCheckMessage("");
          onSuccess();
        } else {
          alert("出品に失敗しました: " + data.message);
        }
      })
      .catch((error) => {
        console.error("出品エラー:", error);
        alert("通信エラーが発生しました。");
      });
  };

  const isDescBtnDisabled = isGeneratingDesc || !name.trim();
  const isPriceBtnDisabled =
    isEstimatingPrice ||
    !name.trim() ||
    !description.trim() ||
    !tags ||
    !itemCondition;
  const isCheckBtnDisabled =
    isCheckingSafety || !name.trim() || !description.trim();

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
        boxSizing: "border-box",
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
        {/* 商品名 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            商品名 <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="商品名を入力"
            value={name}
            onChange={(e) => handleTextChange("name", e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* AI商品説明生成 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button
            type="button"
            onClick={handleSuggestDescription}
            disabled={isDescBtnDisabled}
            style={{
              padding: "10px",
              backgroundColor: isDescBtnDisabled ? "#f1f5f9" : "#f3e8ff",
              color: isDescBtnDisabled ? "#94a3b8" : "#6b21a8",
              border: isDescBtnDisabled
                ? "1px solid #cbd5e1"
                : "1px solid #c084fc",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: isDescBtnDisabled ? "not-allowed" : "pointer",
            }}
          >
            {isGeneratingDesc ? "⏳ AI執筆中..." : "🧠 AI自動商品説明文の生成"}
          </button>
        </div>

        {/* 商品説明本文 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            商品説明 <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <textarea
            placeholder="商品の詳細な説明文"
            value={description}
            onChange={(e) => handleTextChange("description", e.target.value)}
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

        {/* 🛡️ AI規約自動チェック特設セクション (1行スマート統合スタイル) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            backgroundColor: "#f8fafc",
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* 💡 縦並びのdivを撤廃し、alignItems: "baseline" で1行に一直線に整流 */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flex: 1,
                marginRight: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#1e293b",
                    flexShrink: 0,
                  }}
                >
                  🛡️ AI自動チェック　
                </span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  出品ポリシー違反がないか自動検査します。
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAiSafetyCheck}
              disabled={isCheckBtnDisabled}
              style={{
                padding: "8px 16px",
                backgroundColor: isCheckBtnDisabled
                  ? "#cbd5e1"
                  : isAiChecked
                    ? "#10b981"
                    : "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "900",
                cursor: isCheckBtnDisabled ? "not-allowed" : "pointer",
                boxShadow: isCheckBtnDisabled
                  ? "none"
                  : "0 4px 10px rgba(79, 70, 229, 0.15)",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {isCheckingSafety
                ? "⏳ 審査中..."
                : isAiChecked
                  ? "✓ 審査完了"
                  : "チェックを行う"}
            </button>
          </div>
          {safetyCheckMessage && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: isAiChecked ? "#ecfdf5" : "#fef2f2",
                color: isAiChecked ? "#065f46" : "#991b1b",
                border: isAiChecked ? "1px solid #a7f3d0" : "1px solid #fca5a5",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {safetyCheckMessage}
            </div>
          )}
        </div>

        {/* ジャンル */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            出品ジャンル <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <select
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: "white",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">-- ジャンルを選択してください --</option>
            {AMAZON_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* 状態 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            商品の状態 <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <select
            value={itemCondition}
            onChange={(e) => setItemCondition(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: "white",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">-- 商品の状態を選択してください --</option>
            {ITEM_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>

        {/* AI価格査定 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button
            type="button"
            onClick={handleSuggestPrice}
            disabled={isPriceBtnDisabled}
            style={{
              padding: "10px",
              backgroundColor: isPriceBtnDisabled ? "#f1f5f9" : "#ecfdf5",
              color: isPriceBtnDisabled ? "#065f46" : "#34d399",
              border: isPriceBtnDisabled
                ? "1px solid #cbd5e1"
                : "1px solid #34d399",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: isPriceBtnDisabled ? "not-allowed" : "pointer",
            }}
          >
            {isEstimatingPrice ? "⏳ 査定中..." : "💰 AI適正価格査定"}
          </button>
        </div>

        {/* 販売価格 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            販売価格 (円) <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <input
            type="number"
            min="0"
            placeholder="金額を入力"
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
            }}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: priceError ? "1px solid #ff4d4d" : "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              backgroundColor: priceError ? "#fef2f2" : "white",
              transition: "all 0.2s",
            }}
          />
          {priceError && (
            <span
              style={{
                color: "#ff4d4d",
                fontSize: "12px",
                fontWeight: "bold",
                marginTop: "2px",
              }}
            >
              ⚠️ {priceError}
            </span>
          )}
        </div>

        {/* ニックネーム */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            出品者ニックネーム <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="出品者の名前を入力してください"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* 発送目安 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            発送までの目安 <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <select
            value={shippingDays}
            onChange={(e) => setShippingDays(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: "white",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">-- 発送までの日数を選択してください --</option>
            {SHIPPING_DAYS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 🤖 AI自動交渉の設定サブセクション */}
        <AiNegoFormSection
          price={price}
          minAcceptablePrice={minAcceptablePrice}
          sellerStance={sellerStance}
          setSellerStance={setSellerStance}
          minPriceError={minPriceError}
          handleMinPriceChange={handleMinPriceChange}
        />

        {/* 画像URL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            商品画像URL{" "}
            <span
              style={{
                color: "#6b7280",
                fontSize: "11px",
                fontWeight: "normal",
              }}
            >
              (任意)
            </span>
          </label>
          <input
            type="text"
            placeholder="空欄ならAIが最適画像を自動セット！✨"
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
          disabled={
            !isAiChecked ||
            !!priceError ||
            (sellerStance !== "値下げは考えていない" && !!minPriceError)
          }
          style={{
            marginTop: "10px",
            padding: "12px",
            backgroundColor:
              !isAiChecked ||
              !!priceError ||
              (sellerStance !== "値下げは考えていない" && !!minPriceError)
                ? "#cbd5e1"
                : "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor:
              !isAiChecked ||
              !!priceError ||
              (sellerStance !== "値下げは考えていない" && !!minPriceError)
                ? "not-allowed"
                : "pointer",
            boxShadow:
              !isAiChecked ||
              !!priceError ||
              (sellerStance !== "値下げは考えていない" && !!minPriceError)
                ? "none"
                : "0 4px 12px rgba(255, 77, 77, 0.2)",
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
