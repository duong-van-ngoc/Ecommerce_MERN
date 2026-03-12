import React from 'react';
import { Link } from 'react-router-dom';
import '../componentStyles/CategoryGrid.css';

const CategoryGrid = () => {
    return (
        <section className="category-grid-section">
            <div className="category-grid-container">
                <div className="category-grid-header">
                    <div>
                        <p className="category-subtitle">Khám Phá</p>
                        <h2 className="category-title">Mua Sắm Theo Danh Mục</h2>
                    </div>
                    <Link to="/products" className="view-all-link hover-link-slide">
                        Xem Tất Cả <span className="view-all-icon">→</span>
                    </Link>
                </div>

                <div className="category-grid-layout">
                    {/* Clothing - Large */}
                    <Link to="/products?category=Quần áo" className="category-item item-clothing delay-100">
                        <div className="category-image-container aspect-3-4 bg-[#E8E6E3]">
                            <div className="category-placeholder">
                                <div className="text-center">
                                    <svg className="category-placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                    <p className="category-placeholder-text">Quần Áo</p>
                                </div>
                            </div>
                            <div className="category-overlay"></div>
                            <div className="category-content gradient-overlay">
                                <p className="category-label label-white">Bộ Sưu Tập</p>
                                <p className="category-name text-white">Quần Áo</p>
                                <p className="category-desc desc-white">Áo • Quần • Set đồ</p>
                            </div>
                        </div>
                    </Link>

                    {/* Accessories - Wide */}
                    <Link to="/products?category=Phụ kiện" className="category-item item-accessories delay-200">
                        <div className="category-image-container aspect-16-9 lg:aspect-[2/1] aspect-wide-lg bg-[#D4D0CB]">
                            <div className="category-placeholder">
                                <p className="category-placeholder-text">Bộ Sưu Tập Phụ Kiện</p>
                            </div>
                            <div className="category-overlay"></div>
                            <div className="category-content">
                                <p className="category-label label-dark">Nổi Bật</p>
                                <p className="category-name text-dark">Phụ Kiện</p>
                            </div>
                        </div>
                    </Link>

                    {/* Bags */}
                    <Link to="/products?category=Túi xách" className="category-item item-bags delay-300">
                        <div className="category-image-container aspect-square bg-[#F5F3F0]">
                            <div className="category-placeholder">
                                <svg className="w-12 h-12 text-[#1A1A1A]/20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <div className="category-overlay hover-accent-overlay"></div>
                            <div className="category-content">
                                <p className="category-name text-lg">Túi Xách</p>
                                <p className="category-desc desc-gray">Khám phá</p>
                            </div>
                        </div>
                    </Link>

                    {/* Watches */}
                    <Link to="/products?category=Đồng hồ" className="category-item item-watches delay-400">
                        <div className="category-image-container aspect-square bg-[#E8E6E3]">
                            <div className="category-placeholder">
                                <svg className="w-12 h-12 text-[#1A1A1A]/20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="category-overlay hover-accent-overlay"></div>
                            <div className="category-content">
                                <p className="category-name text-lg">Đồng Hồ</p>
                                <p className="category-desc desc-gray">Khám phá</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;

