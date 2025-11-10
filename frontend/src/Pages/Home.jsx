import React ,{useEffect} from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import ImageSlide from '../components/ImageSlider'
import Product from '../components/Product'
import Loader from '../components/Loader'

import '../pageStyles/Home.css'
import PageTitle from '../components/PageTitle'
import { useDispatch, useSelector } from 'react-redux'
import {getProduct, removeErrors } from '../features/products/productSlice'
import {toast} from 'react-toastify'




function Home() {
   const {loading, error, products,productCount} =  useSelector((state) => state.product)
  
    const dispatch = useDispatch();
    useEffect(() => {

        dispatch(getProduct());
        
        
    }, [dispatch])

    useEffect(() => {
      if(error) {
        toast.error(error.message, {position: 'top-center' , autoClose:3000});
        dispatch(removeErrors)
      }
    }, [dispatch, error])
  return (
    <>
    {/* <Loader /> */}
    {loading? (<Loader/>) :( <>
        <PageTitle title = "Home - E Commerce App"/>
        <Navbar />
        <ImageSlide />
        <div className="home-container">
          <h2 className="home-heading">Xu huong hien tai</h2>
          <div className="home-product-container">
          {products.map((product, index) => (
            <Product product = {product } key= {index}/>
          ))}
          </div>
        </div>
        <Footer/>
    </>)}
    </>
  )
}

export default Home