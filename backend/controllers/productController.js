
import Product from '../models/productModel.js';
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';
import { response } from 'express';



// http://localhost:8000/api/v1/products/68d55fc51df263a82ebbdeec?keyword =phone 


// tao san pham 
export const createProducts = handleAsyncError(async (req, res, next) => { // req de lay du lieu tu client gui len, res de tra du lieu ve client
    
    req.body.user = req.user.id;
    console.log(req.user);
    
    const product = await Product.create(req.body); // tạo sản phẩm mới từ dữ liệu trong req.body // req.body là dữ liệu gửi từ client
    res.status(201).json({ 
        success: true, 
        product
     })
})
 

// Lấy tất cả sản phẩm
export const getAllProducts = handleAsyncError(async (req, res, next) => {
    const resultPerPage = 2

    const apiFeatures = new APIFunctionality(Product.find(), req.query)
    .search().filter()
    // lọc filter trước khi phân trang 
    const filteredQuery =  apiFeatures.query.clone()  // tạo bản sao của query để đếm số lượng sản phẩm sau khi filter
    const productCount = await filteredQuery.countDocuments() 

    // tổng số sản phẩm sau khi filter 
    const  totalPages = Math.ceil(productCount/resultPerPage)

    const page = Number(req.query.page)  || 1 
    if(page > totalPages && productCount > 0) {
        return next(new HandleError("Trang không tồn tại", 404))

    }
    // phân trang 
    apiFeatures.pagination(resultPerPage);
    const products = await apiFeatures.query
    if(!products || products.length === 0 ) {
        return next(new HandleError(" không tìm thấy sản phẩm ", 404))
    }
    res.status(200).json({ 
        success: true,
        products,
        productCount,
        resultPerPage,
        totalPages,
        currentPage: page
    });
})

// cập nhật sản phẩm 
export const updateProduct = async (req, res, next) => {

     const product = await Product.findByIdAndUpdate(req.params.id , req.body, {
        new: true,
        runvalidaters: true,
     })
if(!product){
    return next(new HandleError("Sản phẩm không tồn tại", 404))
     }
    res.status(200).json({
    success: true,
    product
    })
}
// Xóa sản phẩm 
export const deteteProduct = handleAsyncError(async (req, res, next) => { 
    const product = await Product.findByIdAndDelete(req.params.id)
    if(!product){
        return next(new HandleError("Sản phẩm không tồn tại", 404))
    }
    res.status(200).json({
        succes: true,
        message: " Xóa sản phẩm thành công"  
    })
})

// truy cập sản phẩm đơn lẻ 
export const getSingleProduct = handleAsyncError( async (req, res, next) => {
    const product = await Product.findById(req.params.id) 
    if(!product){
        return next(new HandleError("Sản phẩm không tồn tại", 404))
    }
    res.status(200).json({
        success: true,
        product
    })
})

// tạo và cập nhật đánh giá san phẩm 
export const createReviewProduct = handleAsyncError(async(req, res,next) => {
    const {rating, comment, productId} = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment 
    }
    const product = await Product.findById(productId) 
    // console.log(product);

    const reviewExist = product.reviews.find(review => review.user.toString() === req.user._id.toString())
    if(reviewExist) {
        product.reviews.forEach(review => {
            if(review.user.toString() === req.user._id.toString()) {
                review.rating = rating,
                review.comment = comment
            }
        })
    }else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let sum = 0;
    product.reviews.forEach(review => {
        sum += review.rating
    })
    product.ratings = sum/product.reviews.length

    await product.save({ validateBeforeSave: false })
    res.status(200).json({
        succes: true,
        message: reviewExist ? "Cập nhật đánh giá thành công!" : "Thêm đánh giá thành công",
        product
    })
        

})

// lấy đánh giá sản phẩm 
export const getReviewProduct = handleAsyncError(async (req, res, next)  => {
    const product = await Product.findById(req.query.id)
    if(!product) {
        return next(new HandleError("Sản phẩn không tồn tại", 400))
    }
    res.status(200).json({
        succes: true,
        review: product.reviews
    })
})

//  xóa đánh giá sản phẩm 

export const deleteReviewProduct  = handleAsyncError(async(req, res, next) => {
    const product = await Product.findById(req.query.productId)
    if(!product) {
        return next(new HandleError("Không tìm thấy id sản phẩm", 400))
    }
    const  reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString() )
    let sum = 0 
    reviews.forEach(review => {
        sum+= review.rating
    })
    const ratings = reviews.length>0?sum/reviews.length:0;
    const numOfReviews = reviews.length
    await Product.findByIdAndUpdate(req.query.productId , {
        reviews, 
        ratings,
        numOfReviews
    },{
        new: true,
        runValidators: true
    })


    
    res.status(200).json({
        success: true,
        message: "Xóa thành công đánh giá sản phẩm"
    })
})

// Admin - lấy tất cả sản phẩm 
export const getAdminProducts = handleAsyncError(async(req, res, next) => {
    const products = await Product.find()
    res.status(200).json({
        succes: true,
        products
    })
})