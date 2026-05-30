import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Store,
  Handshake,
  Truck,
  Box,
  CheckCircle2,
  Zap,
  MessageSquare,
  Send,
} from "lucide-react";

function TransactionTab({ transactionId, myAppId, setCurrentTab }) {
  const [txData, setTxData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  const API_URL =
    "https://hackathon-backend-63005122361.us-central1.run.app/api";

  // 📡 仕組み: 取引基本情報とメッセージ履歴をフェッチ
  useEffect(() => {
    if (!transactionId) return;

    const fetchAllData = () => {
      // ① 取引詳細の取得
      fetch(`${API_URL}/transactions/${transactionId}`)
        .then((res) => res.json())
        .then((data) => setTxData(data))
        .catch((err) => console.error("取引データ取得エラー:", err));

      // ② メッセージ履歴の取得
      fetch(`${API_URL}/transactions/${transactionId}/messages`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setMessages(data);
        })
        .catch((err) => console.error("メッセージ取得エラー:", err));
    };

    fetchAllData();
    const timer = setInterval(fetchAllData, 3000); // 3秒ごとに自動同期
    return () => clearInterval(timer);
  }, [transactionId]);

  // 📜 仕組み: メッセージ更新時に最下部へ自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ✉️ 仕組み: メッセージ送信
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    fetch(`${API_URL}/transactions/${transactionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: myAppId,
        message: inputText,
      }),
    })
      .then(() => {
        setInputText("");
      })
      .catch((err) => console.error("メッセージ送信エラー:", err))
      .finally(() => setIsSending(false));
  };

  // 🚀 仕組み: 取引ステータスを次のステップへ（発送・受取評価）
  const handleProgressStep = () => {
    if (!txData) return;

    // 💡 公式カタログ品（seller_idが無い）の場合は、倉庫ロボットが出荷するストーリーにする
    const isOfficial = !txData.seller_id;

    const confirmMsg =
      txData.transaction_status === "shipping_pending"
        ? isOfficial
          ? "【デモ操作】倉庫から商品を即時出荷させますか？"
          : "商品の発送を完了しましたか？（購入者へ通知されます）"
        : "商品を受け取り、中身を確認しましたか？（取引が完了します）";

    if (!window.confirm(confirmMsg)) return;

    fetch(`${API_URL}/transactions/${transactionId}/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: myAppId }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("ステータスを更新しました！");
      })
      .catch((err) => alert("エラーが発生しました"));
  };

  if (!txData)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#9ca3af",
          fontSize: "14px",
        }}
      >
        取引データを読み込み中...
      </div>
    );

  const isSeller = myAppId === txData.seller_id;
  const isBuyer = myAppId === txData.buyer_id;
  const isOfficialItem = !txData.seller_id; // 公式カタログ品かどうかの判定フラグ

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 🔙 戻るボタンの近代化 */}
      <button
        onClick={() => setCurrentTab("home")}
        style={{
          alignSelf: "flex-start",
          border: "none",
          background: "none",
          color: "#6b7280",
          cursor: "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontWeight: "500",
        }}
      >
        <ArrowLeft size={16} />
        <span>ホームへ戻る</span>
      </button>

      {/* 📦 商品情報ヘッダー */}
      <div
        style={{
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <img
          src={txData.item_image_url}
          alt=""
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "8px",
            objectFit: "cover",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "2px",
            }}
          >
            {/* 💡 取引種別に応じてアイコンを美麗にスイッチ */}
            {isOfficialItem ? (
              <Store size={13} color="#6b7280" />
            ) : (
              <Handshake size={13} color="#6b7280" />
            )}
            <span>{isOfficialItem ? "公式ストア取引" : "ユーザー間取引"}</span>
          </div>
          <div style={{ fontWeight: "bold", color: "#333", fontSize: "15px" }}>
            {txData.item_name}
          </div>
          <div
            style={{
              color: "#ff4d4d",
              fontWeight: "bold",
              fontSize: "14px",
              marginTop: "2px",
            }}
          >
            ¥{txData.item_price.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 🚥 取引ステータス・アクションエリア */}
      <div
        style={{
          backgroundColor: isOfficialItem ? "#f5f3ff" : "#fff9f9", // 公式品なら上品な紫台座に
          border: isOfficialItem ? "1px solid #ddd6fe" : "1px solid #ffcccc",
          padding: "20px",
          borderRadius: "16px",
          textAlign: "center",
        }}
      >
        {/* 状態見出しの記号化 */}
        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "16px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontWeight: "bold",
          }}
        >
          {txData.transaction_status === "shipping_pending" && (
            <>
              <Truck size={18} color="#333" />
              <span>発送待ち</span>
            </>
          )}
          {txData.transaction_status === "shipped" && (
            <>
              <Box size={18} color="#333" />
              <span>発送済み・受取待ち</span>
            </>
          )}
          {txData.transaction_status === "completed" && (
            <>
              <CheckCircle2 size={18} color="#16a34a" />
              <span style={{ color: "#16a34a" }}>取引完了</span>
            </>
          )}
        </h3>

        <div
          style={{
            fontSize: "13px",
            color: "#666",
            marginBottom: "15px",
            lineHeight: "1.5",
          }}
        >
          {txData.transaction_status === "shipping_pending" &&
            (isOfficialItem
              ? "公式カタログ品のため、システムが自動で発送準備を行っています。"
              : isSeller
                ? "商品を発送し、発送通知を送ってください。"
                : "出品者からの発送通知をお待ちください。")}
          {txData.transaction_status === "shipped" &&
            (isBuyer
              ? "商品が届いたら内容を確認し、受取評価をしてください。"
              : "購入者の受取評価をお待ちください。")}
          {txData.transaction_status === "completed" &&
            "この取引は無事に完了しました。ご利用ありがとうございました！"}
        </div>

        {/* 権利に応じたダイナミックボタンの線画化 */}
        {txData.transaction_status === "shipping_pending" &&
          (isSeller || (isOfficialItem && isBuyer)) && (
            <button
              onClick={handleProgressStep}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: isOfficialItem ? "#7c3aed" : "#ff4d4d", // 公式品ならメカニカルな紫
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: isOfficialItem
                  ? "0 4px 12px rgba(124,58,237,0.2)"
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {isOfficialItem ? (
                <>
                  <Zap size={16} fill="white" />
                  <span>【デモ用】倉庫から即時出荷する</span>
                </>
              ) : (
                "商品の発送を通知する"
              )}
            </button>
          )}

        {txData.transaction_status === "shipped" && isBuyer && (
          <button
            onClick={handleProgressStep}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#ff4d4d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <CheckCircle2 size={16} />
            <span>商品を受け取ったので評価する</span>
          </button>
        )}
      </div>

      {/* 💬 チャットエリア */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          height: "400px",
        }}
      >
        <div
          style={{
            padding: "12px",
            textAlign: "center",
            borderBottom: "1px solid #f3f4f6",
            fontSize: "12px",
            color: "#9ca3af",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <MessageSquare size={14} color="#9ca3af" />
          <span>取引メッセージ</span>
        </div>

        {/* メッセージリスト */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {messages.map((msg, idx) => {
            const isBot = msg.sender_id === 0; // 公式システムBot判定
            const isMe = msg.sender_id === myAppId;

            // 🤖 公式システムBotからの通知バブルのスマート化
            if (isBot) {
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: "center",
                    maxWidth: "90%",
                    margin: "6px 0",
                    animation: "fadeIn 0.3s ease-out",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      lineHeight: "1.5",
                      border: "1px solid #cbd5e1",
                      textAlign: "center",
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            }

            // 👤 通常のユーザー間チャットバブル
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <div
                  style={{
                    backgroundColor: isMe ? "#ff4d4d" : "#f3f4f6",
                    color: isMe ? "white" : "#333",
                    padding: "10px 14px",
                    borderRadius: isMe
                      ? "18px 18px 2px 18px"
                      : "18px 18px 18px 2px",
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                >
                  {msg.message}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#9ca3af",
                    textAlign: isMe ? "right" : "left",
                    marginTop: "4px",
                  }}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "13px",
                marginTop: "4px",
                padding: "40px 0",
                border: "1px dashed #e5e7eb",
                borderRadius: "12px",
                backgroundColor: "#fafafa",
                margin: "15px",
              }}
            >
              メッセージを送信して挨拶しましょう
            </div>
          )}
        </div>

        {/* 送信フォームのボタン線画化 */}
        {txData.transaction_status !== "completed" && (
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "15px",
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="メッセージを入力..."
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "20px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              style={{
                backgroundColor: "#ff4d4d",
                color: "white",
                border: "none",
                padding: "0 16px",
                borderRadius: "20px",
                fontWeight: "bold",
                cursor: "pointer",
                opacity: inputText.trim() ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <Send size={14} />
              <span>送信</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default TransactionTab;
