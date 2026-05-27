// 📚 日本語ユーザーの直感に最適化された21カテゴリ
export const AMAZON_CATEGORIES = [
  {
    value: "Clothing_Shoes_and_Jewelry",
    label: "服・靴・ファッション小物 (Clothing_Shoes_and_Jewelry)",
  },
  {
    value: "Beauty_and_Personal_Care",
    label: "コスメ・パーソナルケア (Beauty_and_Personal_Care)",
  },
  { value: "All_Beauty", label: "ビューティー・コスメ全般 (All_Beauty)" },
  {
    value: "Cell_Phones_and_Accessories",
    label: "スマートフォン・携帯アクセサリ (Cell_Phones_and_Accessories)",
  },
  { value: "Electronics", label: "家電・カメラ・オーディオ (Electronics)" },
  { value: "Video_Games", label: "テレビゲーム・機材 (Video_Games)" },
  { value: "Appliances", label: "大型家電・家庭用機器 (Appliances)" },
  {
    value: "Toys_and_Games",
    label: "おもちゃ・ホビー・ゲーム (Toys_and_Games)",
  },
  { value: "Books", label: "本・書籍 (Books)" },
  { value: "CDs_and_Vinyl", label: "CD・レコード・音楽 (CDs_and_Vinyl)" },
  { value: "Movies_and_TV", label: "DVD・ブルーレイ・映画 (Movies_and_TV)" },
  {
    value: "Musical_Instruments",
    label: "楽器・音響機器 (Musical_Instruments)",
  },
  { value: "Handmade_Products", label: "ハンドメイド作品 (Handmade_Products)" },
  {
    value: "Home_and_Kitchen",
    label: "ホーム＆キッチン・家具 (Home_and_Kitchen)",
  },
  { value: "Office_Products", label: "オフィス用品・文房具 (Office_Products)" },
  { value: "Pet_Supplies", label: "ペット用品 (Pet_Supplies)" },
  {
    value: "Grocery_and_Gourmet_Food",
    label: "食品・飲料・お酒 (Grocery_and_Gourmet_Food)",
  },
  {
    value: "Sports_and_Outdoors",
    label: "スポーツ＆アウトドア (Sports_and_Outdoors)",
  },
  {
    value: "Tools_and_Home_Improvement",
    label: "工具・DIY・住宅設備 (Tools_and_Home_Improvement)",
  },
  {
    value: "Patio_Lawn_and_Garden",
    label: "ガーデン・エクステリア (Patio_Lawn_and_Garden)",
  },
  { value: "Automotive", label: "車・バイク用品 (Automotive)" },
];

export const ITEM_CONDITIONS = [
  "新品・未使用",
  "未使用に近い",
  "目立った傷や汚れなし",
  "やや傷や汚れあり",
  "傷や汚れあり",
  "全体的に状態が悪い",
];

export const SHIPPING_DAYS_OPTIONS = [
  { value: "1〜2日で発送", label: "1〜2日以内に発送" },
  { value: "3〜4日で発送", label: "3〜4日以内に発送" },
  { value: "5〜6日で発送", label: "5〜6日以内に発送" },
  { value: "7日以上で発送", label: "7日以上（1週間以降）で発送" },
];

export const CATEGORY_IMAGE_POOLS = {
  All_Beauty: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600",
  ],
  Appliances: [
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600",
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600",
    "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600",
  ],
  Automotive: [
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600",
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600",
  ],
  Beauty_and_Personal_Care: [
    "https://images.unsplash.com/photo-1608248597481-496100c80836?w=600",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
    "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600",
  ],
  Books: [
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600",
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
  ],
  CDs_and_Vinyl: [
    "https://images.unsplash.com/photo-1539628399213-d6aa19c93074?w=600",
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600",
    "https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?w=600",
  ],
  Cell_Phones_and_Accessories: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600",
  ],
  Clothing_Shoes_and_Jewelry: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
  ],
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  ],
  Grocery_and_Gourmet_Food: [
    "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600",
  ],
  Handmade_Products: [
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600",
    "https://images.unsplash.com/photo-1561715276-a2d087060f1d?w=600",
  ],
  Home_and_Kitchen: [
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600",
    "https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=600",
    "https://images.unsplash.com/photo-1534349762230-e0cadf78f5db?w=600",
  ],
  Movies_and_TV: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600",
  ],
  Musical_Instruments: [
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600",
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600",
  ],
  Office_Products: [
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600",
    "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=600",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600",
  ],
  Patio_Lawn_and_Garden: [
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600",
  ],
  Pet_Supplies: [
    "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600",
    "https://images.unsplash.com/photo-1541599540903-216a46cc1ad6?w=600",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600",
  ],
  Sports_and_Outdoors: [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600",
    "https://images.unsplash.com/photo-1502904585520-fa4514c950bf?w=600",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
  ],
  Tools_and_Home_Improvement: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600",
    "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=600",
    "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600",
  ],
  Toys_and_Games: [
    "https://images.unsplash.com/photo-1531651008558-ed1740375b39?w=600",
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600",
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600",
  ],
  Video_Games: [
    "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600",
  ],
};

export const ALL_FLAT_IMAGES = Object.values(CATEGORY_IMAGE_POOLS).flat();
