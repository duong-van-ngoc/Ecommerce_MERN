
import Product from '../models/productModel.js';
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';



// http://localhost:8000/api/v1/products/68d55fc51df263a82ebbdeec?keyword =phone 


// tao san pham 
export const createProducts = handleAsyncError(async (req, res, next) => { // req de lay du lieu tu client gui len, res de tra du lieu ve client
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