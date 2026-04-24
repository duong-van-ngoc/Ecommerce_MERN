import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getProduct } from "@/features/products/productSlice";

function useProductFetch({
  appliedPrice,
  currentPage,
  inStockOnly,
  keyword,
  selectedCategories,
  selectedRating,
  sortBy,
}) {
  const dispatch = useDispatch();
  const {
    loading,
    error,
    products = [],
    productCount = 0,
    hasResults,
    relatedProducts = [],
  } = useSelector((state) => state.product);

  useEffect(() => {
    const category = selectedCategories.length > 0 ? selectedCategories[0] : null;

    dispatch(
      getProduct({
        keyword,
        page: currentPage,
        category,
        price: appliedPrice,
        sort: sortBy,
        ratings: selectedRating
          ? { gte: selectedRating, lt: selectedRating + 1 }
          : null,
        inStock: inStockOnly,
      }),
    );
  }, [
    dispatch,
    currentPage,
    selectedCategories,
    keyword,
    appliedPrice,
    sortBy,
    selectedRating,
    inStockOnly,
  ]);

  return {
    error,
    hasResults,
    loading,
    productCount,
    products,
    relatedProducts,
  };
}

export default useProductFetch;
