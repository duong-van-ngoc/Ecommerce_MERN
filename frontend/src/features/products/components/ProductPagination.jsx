import Pagination from "@/shared/components/Pagination";

function ProductPagination({ currentPage, onPageChange }) {
  return <Pagination currentPage={currentPage} onPageChange={onPageChange} />;
}

export default ProductPagination;
