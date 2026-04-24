import React from 'react'
import '@/shared/components/styles/Footer.css'
import { Phone, Mail, GitHub, Facebook, Instagram } from '@mui/icons-material'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section contact">
          <h3>Kết nối với chúng tôi</h3>
          <p><Phone fontSize='small' />Điện thoại: +84123456789</p>
          <p><Mail fontSize='small' />Email: dvn150903@gmail.com</p>
        </div>

        <div className="footer-section social">
          <h3>Theo dõi chúng tôi</h3>
          <div className="social-">
            <a href="" target='_blank' rel="noreferrer" className="hover-scale-up">
              <GitHub className='social-icon hover-icon-btn' />
            </a>
            <a href="" target='_blank' rel="noreferrer" className="hover-scale-up">
              <Facebook className='social-icon hover-icon-btn' />
            </a>
            <a href="" target='_blank' rel="noreferrer" className="hover-scale-up">
              <Instagram className='socail-icon hover-icon-btn' />
            </a>
          </div>
        </div>

        <div className="footer-section about">
          <h3>Về chúng tôi</h3>
          <p></p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 DuongNgoc </p>
      </div>
    </footer>
  )
}

export default Footer
