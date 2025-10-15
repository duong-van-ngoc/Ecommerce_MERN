import React, {useState}from 'react'
import {Link} from 'react-router-dom'
import '../componentStyles/Navbar.css'
import { Close, Menu, PersonAdd, Search, ShoppingCart  } from '@mui/icons-material'




function Navbar() {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu =() => setIsMenuOpen(!isMenuOpen)
    const isAuthentication = true



  return (
    <>
        <nav className="navbar">
            <div className="navbar-container">
                 {/* Logo */}
                <div className="navbar-logo">
                    <Link to = "/" onClick={() => setIsMenuOpen(false)}
                    >ToBi Shop</Link>
                </div>
                {/* Menu */}
                <div className= {` navbar-links ${isMenuOpen? 'active': ""} `} >
                    <ul>
                        <li><Link to="/" onClick={()=> setIsMenuOpen(false)}
                        >Trang chủ</Link></li>
                        <li><Link to="/products">Sản Phẩm</Link></li>
                        <li><Link to="/about-us">Về Chúng Tôi</Link></li>
                        <li><Link to="/contact">Liên Hệ</Link></li>
                        
                    </ul>
                </div>
                 {/* Thanh tìm kiếm */}
                <div className="navbar-icons">
                    <div className="search-container">
                        <div className="search-form">
                            <input
                            type="text"
                            className="search-input"
                            placeholder=" Tìm kiếm sản phẩm.."
                            />
                            <button className="search-icon">
                            <Search focusable="false" fontSize="small" />
                            </button>
                        </div>
                    </div>

                 {/* giỏ hàng */}
                    <div className="cart-container">
                        <Link to="/cart">
                        <ShoppingCart  className="icon" />
                        <span className="cart-badge">6</span>
                        </Link>
                    </div>
                 {/* Đăng kí */}
                   { !isAuthentication && <Link to="/register" className='register-link'> 
                    <PersonAdd  className='icon'/>
                    </Link>}
                 {/* Close */}
                    <div className="navbar-hamburger" onClick={toggleMenu}>
                    { isMenuOpen? <Close className='icon'/> : <Menu className='icon'/>}
                    </div>

                </div>


            </div>
        </nav>

    </>
  )
}

export default Navbar