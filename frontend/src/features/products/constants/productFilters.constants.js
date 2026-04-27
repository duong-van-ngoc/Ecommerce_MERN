export const PRICE_MIN = 0;

export const PRICE_MAX = 30000000;

export const PRODUCT_FILTER_RATINGS = [5, 4, 3, 2, 1];

export const PRODUCT_PRICE_PRESETS = [
  { label: "Dưới 100k", min: 0, max: 100000 },
  { label: "100k - 500k", min: 100000, max: 500000 },
  { label: "500k - 1tr", min: 500000, max: 1000000 },
  { label: "Trên 1tr", min: 1000000, max: PRICE_MAX },
];

export const PRODUCT_CATEGORY_TREE = [
  {
    title: "NAM",
    groups: [
      {
        title: "Áo",
        items: [
          { label: "Thun", value: "Áo thun nam" },
          { label: "Sơ mi", value: "Áo sơ mi nam" },
          { label: "Hoodie", value: "Áo hoodie nam" },
          { label: "Khoác", value: "Áo khoác nam" },
          { label: "Polo", value: "Áo polo nam" },
        ],
      },
      {
        title: "Quần",
        items: [
          { label: "Jean", value: "Quần jean nam" },
          { label: "Short", value: "Quần short nam" },
          { label: "Kaki", value: "Quần kaki nam" },
          { label: "Jogger", value: "Quần jogger nam" },
        ],
      },
    ],
  },
  {
    title: "NỮ",
    groups: [
      {
        title: "Áo",
        items: [
          { label: "Thun", value: "Áo thun nữ" },
          { label: "Sơ mi", value: "Áo sơ mi nữ" },
          { label: "Kiểu", value: "Áo kiểu nữ" },
          { label: "Khoác", value: "Áo khoác nữ" },
        ],
      },
      {
        title: "Váy",
        items: [
          { label: "Ngắn", value: "Váy ngắn nữ" },
          { label: "Dài", value: "Váy dài nữ" },
          { label: "Body", value: "Váy body nữ" },
        ],
      },
    ],
  },
  {
    title: "UNISEX",
    items: [
      { label: "Áo thun", value: "Áo thun unisex" },
      { label: "Hoodie", value: "Hoodie unisex" },
      { label: "Áo khoác", value: "Áo khoác unisex" },
    ],
  },
  {
    title: "PHỤ KIỆN & GIÀY DÉP",
    groups: [
      {
        title: "Giày dép",
        items: [
          { label: "Giày dép nam", value: "Giày dép nam" },
          { label: "Giày dép nữ", value: "Giày dép nữ" },
          { label: "Giày dép unisex", value: "Giày dép unisex" },
        ],
      },
      {
        title: "Phụ kiện Nam",
        items: [
          { label: "Mũ", value: "Mũ nam" },
          { label: "Thắt lưng", value: "Thắt lưng nam" },
          { label: "Ví", value: "Ví nam" },
          { label: "Kính", value: "Kính nam" },
          { label: "Trang sức", value: "Trang sức nam" },
        ],
      },
      {
        title: "Phụ kiện Nữ",
        items: [
          { label: "Túi xách", value: "Túi xách nữ" },
          { label: "Mũ", value: "Mũ nữ" },
          { label: "Kính", value: "Kính nữ" },
          { label: "Trang sức", value: "Trang sức nữ" },
          { label: "Khăn", value: "Khăn nữ" },
        ],
      },
    ],
    items: [{ label: "Phụ kiện unisex", value: "Phụ kiện unisex" }],
  },
];
