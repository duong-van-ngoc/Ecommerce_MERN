import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { formatVND } from '@/shared/utils/formatCurrency';
import { motion } from 'framer-motion';

function Product({ product }) {
    // Tính % giảm giá
    const discountPercent = product.originalPrice && product.originalPrice > product.price
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        size={12} 
                        className={star <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} 
                    />
                ))}
            </div>
        );
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/10 transition-all duration-500 font-sans"
        >
            <Link to={`/product/${product._id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                    <img
                        src={product.images?.[0]?.url || "/images/placeholder-product.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay Actions (Wishlist) */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Wishlist logic
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-text-secondary hover:text-accent hover:bg-white shadow-sm transition-all active:scale-90"
                            aria-label="Thêm vào danh sách yêu thích"
                        >
                            <Heart size={18} />
                        </button>
                    </div>

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                        <div className="absolute top-3 left-3 bg-accent text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-lg shadow-accent/20 flex items-center">
                            -{discountPercent}%
                        </div>
                    )}

                    {/* Quick Add Button */}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Add to cart logic would go here, or just link to product
                            }}
                            className="w-full bg-primary text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-primary/20"
                        >
                            <ShoppingCart size={14} />
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-5">
                    {/* Category */}
                    <div className="mb-1.5 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                            {typeof product.category === 'object' 
                                ? (product.category.level3 || product.category.level2 || product.category.level1) 
                                : product.category || "General"}
                        </span>
                        <div className="flex items-center gap-1">
                            {renderStars(product.ratings)}
                        </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-sm sm:text-base font-bold text-primary mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-accent transition-colors leading-snug">
                        {product.name}
                    </h3>

                    {/* Price & Stats */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base sm:text-lg font-black text-primary">
                                {formatVND(product.price)}
                            </span>
                            {product.originalPrice > product.price && (
                                <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                                    {formatVND(product.originalPrice)}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                <span>{product.numOfReviews || 0} đánh giá</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                Đã bán {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default Product;