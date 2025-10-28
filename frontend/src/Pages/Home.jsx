import React from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import ImageSlide from '../components/ImageSlider'
import Product from '../components/Product'


import '../pageStyles/Home.css'
import PageTitle from '../components/PageTitle'
const products =  [
        {
            "_id": "68d8f764e87a4639bfb3a7d9",
            "name": "Apple",
            "description": "This is Apple",
            "price": 2040,
            "ratings": 4.5,
            "images": [
                {
                    "public_id": "test123",
                    "url": "https://example.com/image.jpg",
                    "_id": "68d8f764e87a4639bfb3a7da"
                }
            ],
            "category": "fruits",
            "stock": 8,
            "numOfReviews": 1,
            "reviews": [
                {
                    "user": "68e110ebb826d5ed42b8564e",
                    "name": "duongngoc",
                    "rating": 5,
                    "comment": "Sản phẩm dùng ổn, chất lượng tốt 1!",
                    "_id": "68e5d733a32d1f020b6f740f"
                }
            ],
            "createdAt": "2025-09-28T08:52:52.050Z",
            "__v": 2
        },
        {
            "_id": "68d96dca2ee03f44d8fa0c70",
            "name": "Banana",
            "description": "This is Banana",
            "price": 2040,
            "ratings": 0,
            "images": [
                {
                    "public_id": "test123",
                    "url": "https://example.com/image.jpg",
                    "_id": "68d96dca2ee03f44d8fa0c71"
                }
            ],
            "category": "fruits",
            "stock": 10,
            "numOfReviews": 0,
            "reviews": [],
            "createdAt": "2025-09-28T17:18:02.453Z",
            "__v": 0
        }
    ]



function Home() {
  return (
    <>
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
    </>

  )
}

export default Home