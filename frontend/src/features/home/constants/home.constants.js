export const HOME_HERO = {
  eyebrow: "Ưu đãi theo mùa - Giảm đến 50%",
  title: "Nâng tầm phong cách mỗi ngày",
  description:
    "Khám phá những món đồ nổi bật cho mùa mới. Chất lượng cao cấp đi cùng thiết kế dễ ứng dụng mỗi ngày.",
  ctaLabel: "Mua ngay",
  ctaTo: "/products",
  image: "/images/banner5.jpg",
  imageAlt: "Banner thời trang nổi bật của ToBi Shop",
};

export const HOME_CATEGORIES = [
  { id: "fashion", label: "Thời trang", icon: "shirt", to: "/products" },
  { id: "men", label: "Nam", icon: "user", to: "/products?category=Áo thun nam" },
  { id: "women", label: "Nữ", icon: "sparkles", to: "/products?category=Áo sơ mi nữ" },
  { id: "hoodie", label: "Hoodie", icon: "layers", to: "/products?category=Hoodie unisex" },
  { id: "bags", label: "Túi xách", icon: "bag", to: "/products?category=Túi xách nữ" },
  { id: "shoes", label: "Giày dép", icon: "badge", to: "/products?category=Giày dép unisex" },
  { id: "accessories", label: "Phụ kiện", icon: "watch", to: "/products?category=Phụ kiện unisex" },
  { id: "explore", label: "Khám phá", icon: "grid", to: "/products" },
];

export const HOME_BENEFITS = [
  {
    id: "shipping",
    title: "Miễn phí vận chuyển",
    description: "Áp dụng cho đơn hàng đủ điều kiện. Giỏ hàng và thanh toán vẫn theo quy trình hiện tại.",
    icon: "truck",
  },
  {
    id: "payment",
    title: "Thanh toán an toàn",
    description: "Thanh toán diễn ra trong luồng checkout và xác thực đã được bảo vệ.",
    icon: "shield",
  },
  {
    id: "returns",
    title: "Đổi trả dễ dàng",
    description: "Thông tin dịch vụ rõ ràng, sẵn sàng kết nối với chính sách thực tế sau này.",
    icon: "return",
  },
];

export const HOME_TESTIMONIALS = [
  // {
  //   id: "customer-1",
  //   name: "Minh Anh",
  //   role: "Khách hàng đã mua",
  //   rating: 5,
  //   content: "Danh sách sản phẩm dễ xem và luồng thanh toán rất mượt.",
  // },
  // {
  //   id: "customer-2",
  //   name: "Quốc Bảo",
  //   role: "Khách quay lại mua",
  //   rating: 5,
  //   content: "Tìm kiếm và giỏ hàng vẫn giữ nguyên sau khi đăng nhập nên mua sắm nhanh hơn nhiều.",
  // },
  // {
  //   id: "customer-3",
  //   name: "Thảo Nguyên",
  //   role: "Khách yêu thời trang",
  //   rating: 4,
  //   content: "Các lối tắt danh mục giúp mình tìm đúng sản phẩm mà không phải lọc quá nhiều.",
  // },
];

export const HOME_FLASH_SALE_END_TIME = {
  hour: 23,
  minute: 59,
};
