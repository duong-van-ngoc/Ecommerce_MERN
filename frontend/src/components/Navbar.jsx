import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../componentStyles/Navbar.css';
import { Close, Menu, PersonAdd, Search, ShoppingCart } from '@mui/icons-material';
import '../pageStyles/Search.css';

function Navbar() {
    // 1. Sửa lỗi chính tả tên biến
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false); 
    const [searchQuery, setSearchQuery] = useState(""); 

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
    
    // Nên lấy biến này từ Context hoặc Redux thực tế, tạm thời để true để test
    const isAuthentication = true; 
    
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Chặn reload trang
        if (searchQuery.trim()) {
            // 2. Sửa lỗi khoảng trắng trong URL: keyword=${...}
            navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
            // Tùy chọn: Đóng thanh search sau khi tìm xong
            setIsSearchOpen(false); 
        } else {
            navigate(`/products`);
        }
        setSearchQuery("")
    };

    // Hàm phụ để đóng menu khi click vào link (giúp code gọn hơn)
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    {/* Logo */}
                    <div className="navbar-logo">
                        <Link to="/" onClick={closeMenu}>ToBi Shop</Link>
                    </div>

                    {/* Menu */}
                    <div className={`navbar-links ${isMenuOpen ? 'active' : ""}`}>
                        <ul>
                            <li>
                                <Link to="/" onClick={closeMenu}>Trang chủ</Link>
                            </li>
                            {/* 3. Thêm onClick={closeMenu} cho tất cả các link để menu tự đóng trên mobile */}
                            <li><Link to="/products" onClick={closeMenu}>Sản Phẩm</Link></li>
                            <li><Link to="/about-us" onClick={closeMenu}>Về Chúng Tôi</Link></li>
                            <li><Link to="/contact" onClick={closeMenu}>Liên Hệ</Link></li>
                        </ul>
                    </div>

                    {/* Thanh tìm kiếm & Icons */}
                    <div className="navbar-icons">
                        <div className="search-container">
                            {/* 4. QUAN TRỌNG: Đổi div thành form để bắt sự kiện Enter */}
                            <form 
                                className={`search-form ${isSearchOpen ? 'active' : ''}`}
                                onSubmit={handleSearchSubmit}
                            >
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Tìm kiếm sản phẩm.."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="button" className="search-icon" onClick={toggleSearch}>
                                    <Search focusable="false" fontSize="small" />
                                </button>
                            </form>
                        </div>

                        {/* Giỏ hàng */}
                        <div className="cart-container">
                            <Link to="/cart" onClick={closeMenu}>
                                <ShoppingCart className="icon" />
                                <span className="cart-badge">6</span>
                            </Link>
                        </div>

                        {/* Đăng kí / Đăng nhập */}
                        {!isAuthentication && (
                            <Link to="/register" className='register-link' onClick={closeMenu}>
                                <PersonAdd className='icon' />
                            </Link>
                        )}

                        {/* Nút Hamburger (Mobile) */}
                        <div className="navbar-hamburger" onClick={toggleMenu}>
                            {isMenuOpen ? <Close className='icon' /> : <Menu className='icon' />}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;