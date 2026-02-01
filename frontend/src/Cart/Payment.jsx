import React from 'react'
import '../CartStyles/Payment.css'
import PageTitle from '../components/PageTitle'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CheckoutPath from './CheckoutPath'
import { Link } from 'react-router-dom'

function Payment() {

    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo'));

  return (

    <>
    <PageTitle title="Payment" />
    <Navbar />
    <CheckoutPath activePath={2} />
    <div className="payment-container">
        <Link to="/order/confirm" className='payment-go-back'>Quay lai</Link>
        <button className="payment-btn">Thanh toan ({orderInfo.total})</button>
    </div>
   
    <Footer />

    </>
)
}

export default Payment