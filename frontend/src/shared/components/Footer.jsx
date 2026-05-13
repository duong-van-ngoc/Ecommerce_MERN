import React from 'react';
import { Phone, Mail, Heart } from 'lucide-react';
import { FaFacebook, FaGithub, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import BrandLogo from '@/shared/components/BrandLogo';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-white pt-20 pb-10 border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Info */}
          <div className="space-y-6">
            <BrandLogo size="lg" tone="light" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-light">
              Định nghĩa lại phong cách thời trang hiện đại với sự kết hợp hoàn hảo giữa tối giản và sang trọng. Trải nghiệm mua sắm đẳng cấp nhất.
            </p>
            <div className="flex items-center gap-4">
              {[FaFacebook, FaInstagram, FaGithub].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-300 group"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Mua sắm</h3>
            <ul className="space-y-3">
              {['Tất cả sản phẩm', 'Giờ vàng', 'Bộ sưu tập mới', 'Bán chạy nhất'].map((item) => (
                <li key={item}>
                  <Link to="/products" className="text-sm font-light text-slate-400 hover:text-accent transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Hỗ trợ</h3>
            <ul className="space-y-3">
              {['Về chúng tôi', 'Chính sách bảo mật', 'Điều khoản dịch vụ', 'Liên hệ'].map((item) => (
                <li key={item}>
                  <Link to="/about-us" className="text-sm font-light text-slate-400 hover:text-accent transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Liên hệ</h3>
            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-sm font-light text-slate-400">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-accent">
                  <Phone size={16} strokeWidth={1.5} />
                </div>
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-4 text-sm font-light text-slate-400">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-accent">
                  <Mail size={16} strokeWidth={1.5} />
                </div>
                <span>contact@tobishop.vn</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs font-light text-slate-500 tracking-wider">
            &copy; {currentYear} TOBI SHOP. Phong cách hiện đại mỗi ngày.
          </p>
          <div className="flex items-center gap-2 text-xs font-light text-slate-500 tracking-wider">
            <span>Phát triển bởi</span>
            <Heart size={14} className="text-accent fill-accent" />
            <span>đội ngũ Tobi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
