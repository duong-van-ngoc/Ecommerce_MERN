import React from 'react'
import '../componentStyles/Footer.css'
import {Phone, Mail,GitHub, Facebook, Instagram } from '@mui/icons-material'


function Footer() {
  return (
        <footer className="footer"> 
          <div className="footer-container">
          {/* SECTION 1*/}
          <div className="footer-section contact">
            <h3>Kết nối với chúng tôi</h3>
            <p><Phone fontSize='small'/>Phone : +84123456789</p>
            <p><Mail fontSize='small'/>Mail : dvn150903@gmail.com</p>
          </div>
          {/* SECTION 2*/}
          <div className="footer-section social">
            <h3>Theo dõi chúng tôi</h3>
            <div className="social-">
              <a href="" target='_blank'>
                  <GitHub  className='social-icon' />
              </a>
              <a href="" target='_blank'>
                <Facebook className='social-icon'/>
              </a>
              <a href="" target='_blank'>
                <Instagram className='socail-icon'/>
              </a>
            </div>
          </div>
          {/* SECTION 3*/}
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