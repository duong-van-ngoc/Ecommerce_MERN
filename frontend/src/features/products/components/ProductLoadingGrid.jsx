function ProductLoadingGrid() {
  return (
    <div className="loading-skeleton">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="skeleton-card" />
      ))}
    </div>
  );
}

export default ProductLoadingGrid;
