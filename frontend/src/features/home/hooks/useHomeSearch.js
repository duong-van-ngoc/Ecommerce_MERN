import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useHomeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const keyword = searchQuery.trim();
      navigate(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : "/products");
    },
    [navigate, searchQuery]
  );

  return {
    searchQuery,
    handleSearchChange,
    handleSearchSubmit,
  };
}

export default useHomeSearch;
