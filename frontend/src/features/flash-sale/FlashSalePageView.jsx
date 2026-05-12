import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import PageTitle from "@/shared/components/PageTitle";
import axios from "@/shared/api/http.js";
import { formatVND } from "@/shared/utils/formatCurrency";
import "@/features/flash-sale/FlashSalePage.css";

const normalizeProduct = (item) => ({
  ...item.product,
  _id: item.product?._id || item.productId,
  price: item.salePrice,
  originalPrice: item.originalPriceSnapshot,
  flashSale: item,
});

function FlashSaleProduct({ product }) {
  const item = product.flashSale;
  const image = product.images?.[0]?.url || "/images/placeholder-product.jpg";
  const percent = item.saleStock > 0 ? Math.min(Math.round((item.soldCount / item.saleStock) * 100), 100) : 0;

  return (
    <Link to={`/product/${product._id}`} className="flash-sale-card">
      <div className="flash-sale-card__image">
        <img src={image} alt={product.name} />
        <span>-{item.discountPercent}%</span>
      </div>
      <div className="flash-sale-card__body">
        <h3>{product.name}</h3>
        <div className="flash-sale-card__price">
          <strong>{formatVND(product.price)}</strong>
          <span>{formatVND(product.originalPrice)}</span>
        </div>
        <div className="flash-sale-progress">
          <i style={{ width: `${percent}%` }} />
        </div>
        <p>Con {item.availableStock} suat Flash Sale</p>
      </div>
    </Link>
  );
}

function FlashSalePageView() {
  const [active, setActive] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      axios.get("/api/v1/flash-sales/active"),
      axios.get("/api/v1/flash-sales/upcoming"),
    ])
      .then(([activeRes, upcomingRes]) => {
        if (!mounted) return;
        setActive(activeRes.data.flashSale || null);
        setUpcoming(upcomingRes.data.flashSales || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const products = useMemo(() => {
    return (active?.items || []).filter((item) => item.product).map(normalizeProduct);
  }, [active]);

  return (
    <>
      <PageTitle title="Flash Sale" />
      <Navbar />
      <main className="flash-sale-page">
        <section className="flash-sale-hero">
          <div>
            <span className="flash-sale-kicker"><Zap size={16} /> Flash Sale</span>
            <h1>{active?.name || "Flash Sale"}</h1>
            <p>
              Gia gioi han theo thoi gian, so luong va moi tai khoan. Gia cuoi cung luon duoc backend xac thuc khi checkout.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="flash-sale-empty">Dang tai Flash Sale...</div>
        ) : products.length > 0 ? (
          <section className="flash-sale-grid">
            {products.map((product) => <FlashSaleProduct key={product._id} product={product} />)}
          </section>
        ) : (
          <div className="flash-sale-empty">Hien chua co Flash Sale dang dien ra.</div>
        )}

        {upcoming.length > 0 && (
          <section className="flash-sale-upcoming">
            <h2>Flash Sale sap dien ra</h2>
            {upcoming.map((sale) => (
              <div key={sale._id} className="flash-sale-upcoming__item">
                <strong>{sale.name}</strong>
                <span>{new Date(sale.startAt).toLocaleString("vi-VN")}</span>
              </div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

export default FlashSalePageView;
