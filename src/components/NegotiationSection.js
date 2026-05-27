import React, { useState } from "react";

function NegotiationSection({
  itemId,
  currentPrice,
  myAppId,
  onNegotiationSuccess,
}) {
  const [negoMode, setNegoMode] = useState("none");
  const [wishPrice, setWishPrice] = useState("");
  const [negoMessage, setNegoMessage] = useState("");
  const [negoResult, setNegoResult] = useState(null);
  const [isConfirmingCounter, setIsConfirmingCounter] = useState(false);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  const handleLaunchNegotiation = (e) => {
    e.preventDefault();
    if (!wishPrice || !negoMessage.trim()) return;

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
        setNegoResult(data);
        setNegoMode("result");
      })
      .catch((err) => {
        console.error("価格交渉エラー:", err);
        alert("交渉通信中にエラーが発生しました。");
        setNegoMode("none");
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
          `🎉 交渉妥協案（${negoResult.settlement_price.toLocaleString()}円）での購入が確定しました！`,
        );
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
      {/* 💡 フルサイズ化により、デモでのアピール度と押しやすさを劇的に向上 */}
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
          }}
        >
          🤖 AIにおまかせ価格交渉（自動利害調停）
        </button>
      )}

      {/* ❶ 入力フォーム（幅計算を 100% 密着に変更して超綺麗に） */}
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
            }}
          >
            🤖 AI代理調停システム起動中
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
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                💰 あなたの希望購入価格（円）
              </label>
              <input
                type="number"
                placeholder="例: 4500"
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
                  fontSize: "14px",
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
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                ❤️ 商品への熱意・理由（AIが出品者へ提示します）
              </label>
              <textarea
                placeholder="例: 大変貴重な書籍のため、ぜひ拝読したく思っております。サークル予算の関係上、もし可能であればお値下げの調停をお願いできないでしょうか？"
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
                onClick={() => setNegoMode("none")}
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
                }}
              >
                交渉をAIに一任する 🪄
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ❷ ローディング */}
      {negoMode === "loading" && (
        <div
          style={{
            padding: "24px",
            backgroundColor: "#f5f3ff",
            border: "1px solid #ddd6fe",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              marginBottom: "10px",
              animation: "spin 1.5s linear infinite",
            }}
          >
            ⏳
          </div>
          <div
            style={{ fontSize: "14px", fontWeight: "bold", color: "#6d28d9" }}
          >
            AI代理エージェントが裏側で交渉中...
          </div>
          <div style={{ fontSize: "12px", color: "#a78bfa", marginTop: "6px" }}>
            Geminiが出品者の最低価格とスタンスを数理分析しています
          </div>
        </div>
      )}

      {/* ❸ 結果画面 */}
      {negoMode === "result" && negoResult && (
        <div
          style={{
            padding: "16px",
            backgroundColor:
              negoResult.status === "ACCEPT"
                ? "#f0fdf4"
                : negoResult.status === "COUNTER"
                  ? "#fef3c7"
                  : "#fef2f2",
            border: `1px solid ${negoResult.status === "ACCEPT" ? "#bbf7d0" : negoResult.status === "COUNTER" ? "#fde68a" : "#fca5a5"}`,
            borderRadius: "16px",
            boxSizing: "border-box",
          }}
        >
          {negoResult.status === "ACCEPT" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#166534",
                }}
              >
                🎉 交渉一発成立！即時取引が確定しました
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
                }}
              >
                取引画面へ進む ➔
              </button>
            </div>
          )}

          {negoResult.status === "COUNTER" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#92400e",
                }}
              >
                🤝 AIから両者の利害を一致させる妥協案の提示
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
                  onClick={() => setNegoMode("none")}
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

          {negoResult.status === "REJECT" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#991b1b",
                }}
              >
                ❌ 条件不一致による交渉決裂
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
                onClick={() => setNegoMode("none")}
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
