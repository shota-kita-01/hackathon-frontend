import React, { useState } from "react";
import {
  Bot,
  AlertTriangle,
  CircleDollarSign,
  Heart,
  Sparkles,
  Loader2,
  PartyPopper,
  ArrowRight,
  Handshake,
  XCircle,
} from "lucide-react";

function NegotiationSection({
  itemId,
  currentPrice,
  myAppId,
  onNegotiationSuccess,
  setIsModalLocked,
}) {
  const [negoMode, setNegoMode] = useState("none");
  const [wishPrice, setWishPrice] = useState("");
  const [negoMessage, setNegoMessage] = useState("");
  const [negoResult, setNegoResult] = useState(null);
  const [isConfirmingCounter, setIsConfirmingCounter] = useState(false);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // モーダルのロックを完全解除する専用ヘルパー
  const resetNegoMode = () => {
    setNegoMode("none");
    if (setIsModalLocked) setIsModalLocked(false);
  };

  const handleLaunchNegotiation = (e) => {
    e.preventDefault();
    if (!wishPrice || !negoMessage.trim()) return;
    if (setIsModalLocked) setIsModalLocked(true);
    setNegoMode("loading");

    fetch(`${API_URL}/items/${itemId}/negotiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyer_id: myAppId,
        wish_price: parseInt(wishPrice),
        message: negoMessage.trim(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem(
          `fleamarket_negotiated_${myAppId}_${itemId}`,
          "true",
        );

        setNegoResult(data);
        setNegoMode("result");

        // 一発成立（ACCEPT）した場合は即座にロックを外して、次の取引画面への自動ワープを滑らかにする
        if (data.status === "ACCEPT" && setIsModalLocked) {
          setIsModalLocked(false);
        }
      })
      .catch((err) => {
        console.error("価格交渉エラー:", err);
        alert("交渉通信中にエラーが発生しました。");
        resetNegoMode(); // エラーが起きた場合は安全にロックを解除して戻す
      });
  };

  const handleAcceptCounterProposal = () => {
    if (!negoResult || !negoResult.settlement_price) return;
    setIsConfirmingCounter(true);

    fetch(`${API_URL}/items/${itemId}/negotiate/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyer_id: myAppId,
        settlement_price: negoResult.settlement_price,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(
          `交渉妥協案（${negoResult.settlement_price.toLocaleString()}円）での購入が確定しました。`,
        );
        if (setIsModalLocked) setIsModalLocked(false);
        onNegotiationSuccess(data.transaction_id);
      })
      .catch((err) => {
        console.error("妥協案承諾エラー:", err);
        alert("決済処理中にエラーが発生しました。");
      })
      .finally(() => setIsConfirmingCounter(false));
  };

  return (
    <div
      style={{ width: "100%", boxSizing: "border-box", marginBottom: "15px" }}
    >
      {negoMode === "none" && (
        <button
          onClick={() => setNegoMode("input")}
          style={{
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "25px",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Bot size={16} color="white" />
          <span>AI自動価格交渉</span>
        </button>
      )}

      {/* 入力フォーム */}
      {negoMode === "input" && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f5f3ff",
            border: "1px solid #ddd6fe",
            borderRadius: "16px",
            boxSizing: "border-box",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#6d28d9",
              marginBottom: "12px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <Bot size={16} />
            <span>AI自動交渉システム起動中</span>
          </div>

          <div
            style={{
              backgroundColor: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "11px",
              color: "#e11d48",
              lineHeight: "1.4",
              marginTop: "-4px",
              marginBottom: "14px",
              textAlign: "left",
              boxSizing: "border-box",
              width: "100%",
              display: "flex",
              alignItems: "start",
              gap: "6px",
            }}
          >
            <AlertTriangle
              size={14}
              color="#e11d48"
              style={{ marginTop: "2px", flexShrink: 0 }}
            />
            <div>
              <strong style={{ fontWeight: "bold" }}>
                本商品への価格交渉は【1人1回限定】です
              </strong>
              <div
                style={{
                  marginTop: "3px",
                  color: "#be123c",
                  fontWeight: "500",
                }}
              >
                一度交渉が開始されると、交渉の成否（成立・決裂）にかかわらず枠が消費されます。
                システムをハックする目的の連続打診を防ぐため、
                <strong>決裂後の再ネゴシエーションは一切できません。</strong>
                希望価格と熱意文は慎重に入力してください。
              </div>
            </div>
          </div>

          <form
            onSubmit={handleLaunchNegotiation}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginBottom: "6px",
                }}
              >
                <CircleDollarSign size={13} />
                <span>あなたの希望購入価格（円）</span>
              </label>
              <input
                type="number"
                placeholder="金額を入力"
                value={wishPrice}
                onChange={(e) => setWishPrice(e.target.value)}
                max={currentPrice - 1}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd6fe",
                  outline: "none",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginBottom: "6px",
                }}
              >
                <Heart size={13} />
                <span>商品への熱意・理由（AIエージェントへ提示します）</span>
              </label>
              <textarea
                placeholder="熱意文を入力してください"
                value={negoMessage}
                onChange={(e) => setNegoMessage(e.target.value)}
                required
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd6fe",
                  outline: "none",
                  fontSize: "13px",
                  resize: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  lineHeight: "1.5",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "4px",
              }}
            >
              <button
                type="button"
                onClick={resetNegoMode}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "white",
                  border: "1px solid #ddd6fe",
                  color: "#6d28d9",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 18px",
                  backgroundColor: "#7c3aed",
                  border: "none",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>交渉をAIに一任する</span>
                <Sparkles size={13} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ローディング (画面ロック中) */}
      {negoMode === "loading" && (
        <div
          style={{
            padding: "24px",
            backgroundColor: "#f5f3ff",
            border: "1px solid #ddd6fe",
            borderRadius: "16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2
            size={24}
            color="#7c3aed"
            className="animate-spin"
            style={{ marginBottom: "10px" }}
          />
          <div
            style={{ fontSize: "14px", fontWeight: "bold", color: "#6d28d9" }}
          >
            AIエージェントが裏側で交渉中...
          </div>
          <div style={{ fontSize: "12px", color: "#a78bfa", marginTop: "6px" }}>
            AIエージェントが出品者の最低価格とスタンスを分析しています
          </div>
        </div>
      )}

      {/* 結果画面 (保留中は画面ロック継続) */}
      {negoMode === "result" && negoResult && (
        <div
          style={{
            padding: "16px",
            backgroundColor:
              negoResult.status === "ACCEPT"
                ? "#f0fdf4"
                : negoResult.status === "COUNTER"
                  ? "#fffbeb"
                  : "#fef2f2",
            border: `1px solid ${negoResult.status === "ACCEPT" ? "#bbf7d0" : negoResult.status === "COUNTER" ? "#fde68a" : "#fca5a5"}`,
            borderRadius: "16px",
            boxSizing: "border-box",
          }}
        >
          {/* A: 交渉成立（ACCEPT） */}
          {negoResult.status === "ACCEPT" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <PartyPopper size={16} color="#166534" />
                <span>交渉が成立し、即時取引が確定しました！</span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#14532d",
                  backgroundColor: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                  fontStyle: "italic",
                  lineHeight: "1.5",
                }}
              >
                「{negoResult.ai_message}」
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "900",
                  color: "#166534",
                }}
              >
                最終合意金額:{" "}
                <span style={{ fontSize: "22px" }}>
                  {negoResult.settlement_price?.toLocaleString()}
                </span>{" "}
                円
              </div>
              <button
                onClick={() => onNegotiationSuccess(negoResult.transaction_id)}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#166534",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <span>取引画面へ進む</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* B: 妥協案提示（COUNTER） */}
          {negoResult.status === "COUNTER" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#92400e",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Handshake size={16} color="#92400e" />
                <span>AIから両者の利害を一致させる妥協案の提示</span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#78350f",
                  backgroundColor: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #fde68a",
                  lineHeight: "1.5",
                }}
              >
                「{negoResult.ai_message}」
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "900",
                  color: "#b45309",
                  textAlign: "center",
                  backgroundColor: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "2px dashed #fde68a",
                }}
              >
                AI提示の妥協合意価格:{" "}
                <span style={{ color: "#ff4d4d", fontSize: "22px" }}>
                  {negoResult.settlement_price?.toLocaleString()}
                </span>{" "}
                円
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={resetNegoMode}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "white",
                    border: "1px solid #fde68a",
                    color: "#92400e",
                    borderRadius: "8px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  今回は見送る
                </button>
                <button
                  onClick={handleAcceptCounterProposal}
                  disabled={isConfirmingCounter}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#d97706",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: isConfirmingCounter ? "not-allowed" : "pointer",
                  }}
                >
                  {isConfirmingCounter ? "処理中..." : "この価格で手を打つ！"}
                </button>
              </div>
            </div>
          )}

          {/* C: 交渉決裂（REJECT） */}
          {negoResult.status === "REJECT" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#991b1b",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <XCircle size={16} color="#991b1b" />
                <span>条件不一致による交渉決裂</span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#7f1d1d",
                  backgroundColor: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #fca5a5",
                  lineHeight: "1.5",
                }}
              >
                「{negoResult.ai_message}」
              </div>
              <button
                onClick={resetNegoMode}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#991b1b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                元の価格のまま検討する
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NegotiationSection;
