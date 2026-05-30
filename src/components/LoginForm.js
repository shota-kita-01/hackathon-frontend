import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { fireAuth } from "../firebase";
import { UserPlus, KeyRound } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("メールアドレスとパスワードを入力してください。");
      return;
    }

    if (isRegisterMode) {
      // 新規アカウント作成
      createUserWithEmailAndPassword(fireAuth, email, password)
        .then((userCredential) => {
          alert("アカウント作成とログインに成功しました。");
        })
        .catch((error) => {
          console.error(error);
          alert(`登録失敗: ${error.message}`);
        });
    } else {
      // 既存アカウントでログイン
      signInWithEmailAndPassword(fireAuth, email, password)
        .then((userCredential) => {
          alert("ログインに成功しました。");
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
        background: "#ffffff",
        padding: "35px 30px",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        border: "1px solid #eeeeee",
        width: "100%",
        maxWidth: "400px",
        margin: "40px auto",
      }}
    >
      <h2
        style={{
          margin: "0 0 25px 0",
          borderBottom: "2px solid #ff4d4d",
          paddingBottom: "12px",
          fontSize: "20px",
          textAlign: "center",
          color: "#333333",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {isRegisterMode ? (
          <UserPlus size={20} color="#333333" />
        ) : (
          <KeyRound size={20} color="#333333" />
        )}
        <span>
          {isRegisterMode ? "新規アカウント登録" : "ログインして始める"}
        </span>
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "18px" }}
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
              marginBottom: "6px",
              color: "#555555",
              fontWeight: "500",
            }}
          >
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
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
              marginBottom: "6px",
              color: "#555555",
              fontWeight: "500",
            }}
          >
            パスワード (6文字以上)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
            backgroundColor: "#ff4d4d",
            color: "white",
            border: "none",
            padding: "14px",
            borderRadius: "25px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "10px",
            boxShadow: "0 4px 12px rgba(255, 77, 77, 0.15)",
            transition: "all 0.2s",
          }}
        >
          {isRegisterMode ? "新規登録する" : "ログインする"}
        </button>
      </form>

      <p
        style={{
          marginTop: "25px",
          textAlign: "center",
          fontSize: "14px",
          color: "#777777",
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
            color: "#ff4d4d",
            cursor: "pointer",
            textDecoration: "underline",
            marginLeft: "5px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {isRegisterMode ? "ログイン画面へ" : "新規登録画面へ"}
        </button>
      </p>
    </div>
  );
}

export default LoginForm;
