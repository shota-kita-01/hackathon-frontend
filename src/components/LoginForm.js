import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { fireAuth } from "../firebase";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false); // 新規登録とログインの切り替えフラグ

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("メールアドレスとパスワードを入力してください！");
      return;
    }

    if (isRegisterMode) {
      // 🌟 新規アカウント作成
      createUserWithEmailAndPassword(fireAuth, email, password)
        .then((userCredential) => {
          alert("🎉 アカウント作成＆ログインに成功しました！");
        })
        .catch((error) => {
          console.error(error);
          alert(`登録失敗: ${error.message}`);
        });
    } else {
      // 🌟 既存アカウントでログイン
      signInWithEmailAndPassword(fireAuth, email, password)
        .then((userCredential) => {
          alert("🔑 ログインに成功しました！");
        })
        .catch((error) => {
          console.error(error);
          alert("ログイン失敗: メールアドレスまたはパスワードが違います。");
        });
    }
  };

  return (
    <div
      style={{
        background: "#2d3748",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        width: "100%",
        maxWidth: "400px",
        margin: "40px auto",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          borderBottom: "2px solid #61dafb",
          paddingBottom: "10px",
          fontSize: "22px",
          textAlign: "center",
        }}
      >
        {isRegisterMode ? "📝 新規アカウント登録" : "🔑 ログインして始める"}
      </h2>
      <form
        onSubmit={handleSubmit}
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
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
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
            パスワード (6文字以上)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
          {isRegisterMode ? "新規登録する" : "ログインする"}
        </button>
      </form>

      <p
        style={{
          marginTop: "20px",
          textAlign: "center",
          fontSize: "14px",
          color: "#a0aec0",
        }}
      >
        {isRegisterMode
          ? "すでにアカウントをお持ちですか？"
          : "初めてのご利用ですか？"}
        <button
          onClick={() => setIsRegisterMode(!isRegisterMode)}
          style={{
            background: "none",
            border: "none",
            color: "#61dafb",
            cursor: "pointer",
            textDecoration: "underline",
            marginLeft: "5px",
            fontSize: "14px",
          }}
        >
          {isRegisterMode ? "ログイン画面へ" : "新規登録画面へ"}
        </button>
      </p>
    </div>
  );
}

export default LoginForm;
