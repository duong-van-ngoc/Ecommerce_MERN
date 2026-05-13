import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getProductDetails, removeErrors } from "@/features/products/productSlice";
import { addItemsToCart, removeMessage } from "@/features/cart/cartSlice";
import axios from "@/shared/api/http.js";

export const COLOR_MAP = {
  Đen: "#000000",
  Black: "#000000",
  Trắng: "#ffffff",
  White: "#ffffff",
  "Xanh dương": "#3b82f6",
  Blue: "#3b82f6",
  Đỏ: "#ef4444",
  Red: "#ef4444",
  Tím: "#8b5cf6",
  Purple: "#8b5cf6",
  Vàng: "#eab308",
  Yellow: "#eab308",
  Xám: "#6b7280",
  Gray: "#6b7280",
  Hồng: "#ec4899",
  Pink: "#ec4899",
  "Xanh lá": "#22c55e",
  Green: "#22c55e",
  Cam: "#f97316",
  Orange: "#f97316",
  Nâu: "#78350f",
  Brown: "#78350f",
  Be: "#f5f5dc",
  Beige: "#f5f5dc",
  Kem: "#fffdd0",
  Cream: "#fffdd0",
  "Xanh đen": "#0f172a",
  Navy: "#0f172a",
  "Xanh rêu": "#3f6212",
  Moss: "#3f6212",
  Bạc: "#c0c0c0",
  Silver: "#c0c0c0",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop";

export function useProductDetail() {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectionError, setSelectionError] = useState(false);
  const [flashSale, setFlashSale] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const {
    loading,
    error,
    product,
    relatedProducts = [],
  } = useSelector((state) => state.product);
  const {
    loading: cartLoading,
    error: cartError,
    success,
    message,
  } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.user);

  const productImages =
    product?.images?.length > 0
      ? product.images.map((img) => img.url.replace("./", "/"))
      : [FALLBACK_IMAGE];

  const productColors =
    product?.colors?.length > 0
      ? product.colors.map((color) => {
          const name =
            typeof color === "string"
              ? color.replace(/[[\]"'\\]/g, "").trim()
              : String(color);

          return {
            name,
            code: COLOR_MAP[name] || "#cccccc",
          };
        })
      : [];

  const productSizes =
    product?.sizes?.length > 0
      ? product.sizes.map((size) => {
          const name =
            typeof size === "string"
              ? size.replace(/[[\]"'\\]/g, "").trim()
              : String(size);

          return { name, available: true };
        })
      : [];

  const originalPrice = product?.originalPrice || 0;
  const discountPercent =
    originalPrice > (product?.price || 0)
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0;

  const soldCount = product?.sold || 0;
  const maxAvailableQuantity = flashSale?.availableStock ?? product?.stock ?? 0;
  const totalReviews = product?.numOfReviews || 0;
  const ratingDistribution = [
    { stars: 5, count: Math.round(totalReviews * 0.85) },
    { stars: 4, count: Math.round(totalReviews * 0.1) },
    { stars: 3, count: Math.round(totalReviews * 0.03) },
    { stars: 2, count: Math.round(totalReviews * 0.01) },
    { stars: 1, count: Math.round(totalReviews * 0.01) },
  ];

  useEffect(() => {
    if (id) dispatch(getProductDetails(id));

    return () => dispatch(removeErrors());
  }, [dispatch, id]);

  useEffect(() => {
    if (!id) return undefined;

    let mounted = true;

    axios
      .get(`/api/v1/products/${id}/flash-sale`)
      .then(({ data }) => {
        if (mounted) setFlashSale(data.flashSale || null);
      })
      .catch(() => {
        if (mounted) setFlashSale(null);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }

    if (cartError) {
      toast.error(cartError, { position: "top-center", autoClose: 3000 });
    }
  }, [dispatch, error, cartError]);

  useEffect(() => {
    if (success) {
      toast.success(message, { position: "top-center", autoClose: 3000 });
      dispatch(removeMessage());
    }
  }, [dispatch, success, message]);

  const increaseQuantity = () => {
    if (maxAvailableQuantity <= quantity) {
      toast.error(`Số lượng không thể vượt quá ${maxAvailableQuantity}`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const validateSelection = () => {
    const invalid =
      (productColors.length > 0 && selectedColor === null) ||
      (productSizes.length > 0 && selectedSize === null);

    if (invalid) setSelectionError(true);

    return !invalid;
  };

  const addToCart = () => {
    if (!validateSelection()) return;

    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", {
        position: "top-center",
        autoClose: 2500,
      });
      navigate(
        `/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`
      );
      return;
    }

    setSelectionError(false);
    dispatch(
      addItemsToCart({
        id,
        quantity,
        size: selectedSize !== null ? productSizes[selectedSize]?.name : "",
        color: selectedColor !== null ? productColors[selectedColor]?.name : "",
      })
    );
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    setSelectionError(false);

    const buyNowItem = {
      product: product._id,
      name: product.name,
      price: flashSale?.salePrice ?? product.price,
      priceSnapshot: flashSale?.salePrice ?? product.price,
      originalPriceSnapshot:
        flashSale?.originalPriceSnapshot ?? product.originalPrice ?? product.price,
      image: product.images?.[0]?.url,
      stock: maxAvailableQuantity,
      pricingType: flashSale ? "flash_sale" : "normal",
      flashSaleId: flashSale?.flashSaleId,
      flashSaleItemId: flashSale?._id,
      quantity,
      size: selectedSize !== null ? productSizes[selectedSize]?.name : "",
      color: selectedColor !== null ? productColors[selectedColor]?.name : "",
    };

    sessionStorage.setItem("directBuyItem", JSON.stringify(buyNowItem));
    dispatch(removeErrors());
    navigate(isAuthenticated ? "/shipping" : "/login?redirect=/shipping");
  };

  const handleColorSelect = (index) => {
    setSelectedColor(index);
    setSelectionError(false);

    if (index < productImages.length) {
      setSelectedImage(index);
    }
  };

  const handleSizeSelect = (index) => {
    if (!productSizes[index]?.available) return;

    setSelectedSize(index);
    setSelectionError(false);
  };

  return {
    quantity,
    activeTab,
    setActiveTab,
    selectedImage,
    setSelectedImage,
    selectedColor,
    selectedSize,
    selectionError,
    loading,
    error,
    product,
    cartLoading,
    productImages,
    productColors,
    productSizes,
    originalPrice,
    discountPercent,
    soldCount,
    flashSale,
    maxAvailableQuantity,
    totalReviews,
    ratingDistribution,
    relatedProducts,
    increaseQuantity,
    decreaseQuantity,
    addToCart,
    handleBuyNow,
    handleColorSelect,
    handleSizeSelect,
  };
}
