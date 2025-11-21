import React, { useEffect } from 'react'
import '../pageStyles/Products.css'
import PageTitle from '../components/PageTitle'
import Navbar from '../components/Navbar'
import { useDispatch, useSelector } from 'react-redux'
import Footer from '../components/Footer'
import { getProduct, removeErrors } from '../features/products/productSlice'
import { toast } from 'react-toastify'
import Product from '../components/Product'
import { useLocation } from 'react-router-dom'
import NoProducts from '../components/NoProduct'


function Products() {
  const {loading, error, products, resultPerPage, productCount} = useSelector(state => state.product)
  const dispatch = useDispatch()
  const location= useLocation()
  const searchParams = new URLSearchParams(location.search)
  console.log(searchParams);
  const keyword = searchParams.get("keyword")
  console.log(keyword);
  

  useEffect(() => {
    dispatch(getProduct(keyword))
  },[dispatch,keyword])

  useEffect(() => {
      if(error) {
        toast.error(error.message, {position: 'top-center', autoClose: 3000})
        dispatch(removeErrors());
      }
  },[dispatch,error])
  return (
   <>
      <PageTitle title =" Tất cả các sản phẩm"/>
      <Navbar/>
      <div className="products-layout">
        <div className="filter-section">
          <h3 className="filter-heading">Danh muc</h3>
           {/* hien thi cac danh muc  */}
        </div>
          <div className="products-section">
              {/* hiển thị tất cả sản phẩm  */}
             {products.length > 0 ? (
               <div className="products-product-container">
                {products.map((product) => (
                  <Product key = {product._id} product = {product} />
                ))}
              </div>
             ) : (
              <NoProducts key = {keyword} />
             )}
          </div>
      </div>
      
      <Footer />
   </>
  )
}

export default Products