import Product from "@/shared/components/Product";

function ProductGrid({ products }) {
  return (
    <div className="products-grid">
      {products.map((product) => (
        <Product key={product._id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
