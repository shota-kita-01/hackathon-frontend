import React from "react";
import ItemList from "./ItemList";

function LikesTab({ userLikes, handleCardClick, handlePurchaseItem }) {
  return (
    <div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
          margin: "0 0 20px 0",
        }}
      >
        ❤️ あなたがお気に入り登録した商品
      </h2>
      {userLikes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#9ca3af",
            padding: "40px 0",
            fontSize: "14px",
          }}
        >
          いいねした商品はまだありません。
        </div>
      ) : (
        <div onClick={(e) => handleCardClick(e, userLikes)}>
          <ItemList items={userLikes} handlePurchaseItem={handlePurchaseItem} />
        </div>
      )}
    </div>
  );
}

export default LikesTab;
