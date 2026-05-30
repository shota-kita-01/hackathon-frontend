import React, { useState } from "react";
import {
  AMAZON_CATEGORIES,
  ITEM_CONDITIONS,
  SHIPPING_DAYS_OPTIONS,
} from "./FormConstants";
import AiNegoFormSection from "./AiNegoFormSection";
// 💡 出品フォームの高度な機能を洗練されたメタに変換するアイコン群をフル召喚
import {
  SquarePen,
  Camera,
  Loader2,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  XCircle,
  Check,
  CircleDollarSign,
  AlertTriangle,
  Rocket,
} from "lucide-react";

function ItemForm({ sellerId, editingItem, onSuccess }) {
  // 💡 editingItem が存在する場合は、その既存データを初期値にハント（自動復元）する
  const [name, setName] = useState(editingItem ? editingItem.name : "");
  const [description, setDescription] = useState(
    editingItem ? editingItem.description : "",
  );
  const [price, setPrice] = useState(editingItem ? editingItem.price : "");
  const [imageUrl, setImageUrl] = useState(
    editingItem ? editingItem.image_url : "",
  );
  const [tags, setTags] = useState(editingItem ? editingItem.tags : "");
  const [itemCondition, setItemCondition] = useState(
    editingItem ? editingItem.item_condition : "",
  );
  const [sellerName, setSellerName] = useState(
    editingItem ? editingItem.seller_nickname || editingItem.seller_name : "",
  );
  const [shippingDays, setShippingDays] = useState(
    editingItem ? editingItem.shipping_days : "",
  );
  const [priceError, setPriceError] = useState("");

  // 🥊 AI自動交渉管理用のState
  const [minAcceptablePrice, setMinAcceptablePrice] = useState(
    editingItem ? editingItem.min_acceptable_price : "",
  );
  const [sellerStance, setSellerStance] = useState(
    editingItem ? editingItem.seller_stance : "",
  );
  const [minPriceError, setMinPriceError] = useState("");

  // 🛡️ AI安全チェック管理用のState（💡 テキスト内から絵文字のノイズを事前に引き算）
  const [isAiChecked, setIsAiChecked] = useState(editingItem ? true : false);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [safetyCheckMessage, setSafetyCheckMessage] = useState(
    editingItem
      ? "出品内容の訂正モードです（再チェックを省略して上書き保存できます）"
      : "",
  );

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);

  // ✨【連打防止ハック】非同期リクエスト中の多重送信を完全にブロックする防弾State
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              "AI規約審査クリア！安全な商品と認定されました。", // 💡 混入していた記号表現を完全クリーン化
            );
          } else {
            setIsAiChecked(false);
            setSafetyCheckMessage(`出品制限: ${data.reason}`);
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
      sellerStance !== "値下げは考えていない" &&
      !String(minAcceptablePrice).trim()
    ) {
      alert(
        "交渉を受け付ける場合は、最低許容価格（デッドライン価格）を入力してください！",
      );
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

    // 🔒 バリデーションをすべて通過した瞬間、送信中フラグを立ててボタンを瞬時にロック！
    setIsSubmitting(true);

    const finalImageUrl = imageUrl.trim();

    const finalMinPrice =
      sellerStance === "値下げは考えていない"
        ? parseInt(price, 10)
        : minAcceptablePrice
          ? parseInt(minAcceptablePrice, 10)
          : parseInt(price, 10);

    const targetUrl = editingItem
      ? `${BASE_API_URL}/items/${editingItem.id}`
      : `${BASE_API_URL}/items`;
    const targetMethod = editingItem ? "PUT" : "POST";

    fetch(targetUrl, {
      method: targetMethod,
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
          alert("処理に失敗しました: " + data.message);
        }
      })
      .catch((error) => {
        console.error("通信エラー:", error);
        alert("通信エラーが発生しました。");
      })
      // 🔓 成功・失敗・例外処理に関わらず、非同期トランザクションが終了したらロックを完全解除
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const isDescBtnDisabled = isGeneratingDesc || !name.trim() || isSubmitting;
  const isPriceBtnDisabled =
    isEstimatingPrice ||
    !name.trim() ||
    !description.trim() ||
    !tags ||
    !itemCondition ||
    isSubmitting;
  const isCheckBtnDisabled =
    isCheckingSafety || !name.trim() || !description.trim() || isSubmitting;

  // 【DRY原則集約】既存のバリデーションロジックに加え、「送信中（isSubmitting）」なら無条件でボタンを無効化する
  const isSubmitDisabled =
    !isAiChecked ||
    !!priceError ||
    isSubmitting ||
    (sellerStance !== "値下げは考えていない" &&
      (!String(minAcceptablePrice).trim() || !!minPriceError));

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
      {/* 📝 / 📸 の動的見出しタイトルをフレックス整列 */}
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
          margin: "0 0 20px 0",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {editingItem ? (
          <>
            <SquarePen size={18} color="#333" />
            <span>出品内容を訂正する</span>
          </>
        ) : (
          <>
            <Camera size={18} color="#333" />
            <span>商品を出品する</span>
          </>
        )}
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
            disabled={isSubmitting} // 送信中は入力フォームも安全のためにロック
            onChange={(e) => handleTextChange("name", e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              backgroundColor: isSubmitting ? "#f1f5f9" : "white",
            }}
          />
        </div>

        {/* 🧠 AI商品説明生成ボタンの記号化 */}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {isGeneratingDesc ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>AI執筆中...</span>
              </>
            ) : (
              <>
                <Brain size={14} />
                <span>AI自動商品説明文の生成</span>
              </>
            )}
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
            disabled={isSubmitting} // ロック
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
              backgroundColor: isSubmitting ? "#f1f5f9" : "white",
            }}
          />
        </div>

        {/* 🛡️ AI規約自動チェック特設セクション */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            backgroundColor: "#f8fafc",
            padding: "16px",
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
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <ShieldCheck size={16} color="#1e293b" />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#1e293b",
                    flexShrink: 0,
                  }}
                >
                  AI自動チェック
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
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {isCheckingSafety ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>審査中...</span>
                </>
              ) : isAiChecked ? (
                <>
                  <Check size={12} />
                  <span>審査完了</span>
                </>
              ) : (
                "チェックを行う"
              )}
            </button>
          </div>

          {/* 🔍 審査メッセージボードの条件分岐・アイコン完全統制 */}
          {safetyCheckMessage && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: isAiChecked ? "#ecfdf5" : "#fef2f2",
                color: isAiChecked ? "#065f46" : "#991b1b",
                border: isAiChecked ? "1px solid #a7f3d0" : "1px solid #fca5a5",
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {isAiChecked ? (
                <CheckCircle2 size={14} color="#065f46" />
              ) : editingItem &&
                !isAiChecked &&
                safetyCheckMessage.includes("訂正モード") ? (
                <SquarePen size={14} color="#991b1b" />
              ) : (
                <XCircle size={14} color="#991b1b" />
              )}
              <span>{safetyCheckMessage}</span>
              {isAiChecked && <Sparkles size={12} color="#065f46" />}
            </div>
          )}
        </div>

        {/* ジャンル */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563" }}
          >
            出品ジャンル <span style={{ color: "#ff4d4d" }}>*</span>
          </label>
          <select
            value={tags}
            disabled={isSubmitting} // ロック
            onChange={(e) => setTags(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: isSubmitting ? "#f1f5f9" : "white",
              outline: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
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
            disabled={isSubmitting} // ロック
            onChange={(e) => setItemCondition(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: isSubmitting ? "#f1f5f9" : "white",
              outline: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
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

        {/* 💰 AI価格査定ボタン */}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {isEstimatingPrice ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>査定中...</span>
              </>
            ) : (
              <>
                <CircleDollarSign size={14} />
                <span>AI適正価格査定</span>
              </>
            )}
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
            disabled={isSubmitting} // ロック
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
              backgroundColor: priceError
                ? "#fef2f2"
                : isSubmitting
                  ? "#f1f5f9"
                  : "white",
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
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <AlertTriangle size={12} />
              <span>{priceError}</span>
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
            disabled={isSubmitting} // ロック
            onChange={(e) => setSellerName(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              backgroundColor: isSubmitting ? "#f1f5f9" : "white",
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
            disabled={isSubmitting} // ロック
            onChange={(e) => setShippingDays(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              backgroundColor: isSubmitting ? "#f1f5f9" : "white",
              outline: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
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
          disabled={isSubmitting} // 必要に応じてサブセクション側にも状態を伝播
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
            placeholder="空欄ならAIが最適画像を自動セット！"
            value={imageUrl}
            disabled={isSubmitting} // ロック
            onChange={(e) => setImageUrl(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              backgroundColor: isSubmitting ? "#f1f5f9" : "white",
            }}
          />
        </div>

        {/* 🚀 / 📝 メインアクションボタンの動的線画化 */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          style={{
            marginTop: "10px",
            padding: "12px",
            backgroundColor: isSubmitDisabled ? "#cbd5e1" : "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: isSubmitDisabled ? "not-allowed" : "pointer",
            boxShadow: isSubmitDisabled
              ? "none"
              : "0 4px 12px rgba(255, 77, 77, 0.2)",
            transition: "background-color 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>タイムラインに出品中...</span>
            </>
          ) : editingItem ? (
            <>
              <SquarePen size={16} />
              <span>出品内容を上書き保存する</span>
            </>
          ) : (
            <>
              <Rocket size={16} />
              <span>この内容でタイムラインに出品する</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ItemForm;
