
import Product from '../models/productModel.js';
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';
import { response } from 'express';



// http://localhost:8000/api/v1/products/68d55fc51df263a82ebbdeec?keyword =phone 


import { v2 as cloudinary } from 'cloudinary';

// tao san pham 
export const createProducts = handleAsyncError(async (req, res, next) => {

    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else if (res.req.files && res.req.files.images) {

        const files = Array.isArray(res.req.files.images) ? res.req.files.images : [res.req.files.images];

    } else {
        // No images
    }

    const imagesLinks = [];

    // Kiểm tra xem có file trong req.files không
    if (req.files && req.files.images) {
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        for (let i = 0; i < files.length; i++) {

            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "products" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(files[i].data);
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;




    if (!req.body.sizes) req.body.sizes = [];
    if (!Array.isArray(req.body.sizes)) req.body.sizes = [req.body.sizes];

    if (!req.body.colors) req.body.colors = [];
    if (!Array.isArray(req.body.colors)) req.body.colors = [req.body.colors];


    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
})


// Lấy tất cả sản phẩm 
export const getAllProducts = handleAsyncError(async (req, res, next) => {
    const resultPerPage = 10

    const apiFeatures = new APIFunctionality(Product.find(), req.query)
        .search().filter().sort()
    // lọc filter trước khi phân trang 
    const filteredQuery = apiFeatures.query.clone()  // tạo bản sao của query để đếm số lượng sản phẩm sau khi filter
    const productCount = await filteredQuery.countDocuments()

    // tổng số sản phẩm sau khi filter 
    const totalPages = Math.ceil(productCount / resultPerPage)

    const page = Number(req.query.page) || 1
    if (page > totalPages && productCount > 0) {
        return next(new HandleError("Trang không tồn tại", 404))

    }
    // phân trang 
    apiFeatures.pagination(resultPerPage);
    const products = await apiFeatures.query;
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
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 404));
    }

    let images = [];

    // Xử lý ảnh cũ
    if (req.body.oldImages) {
        // Nó đến dưới dạng chuỗi JSON từ frontend
        try {
            const oldImages = JSON.parse(req.body.oldImages);
            if (Array.isArray(oldImages)) {
                images = [...oldImages];
            }
        } catch (e) {
            console.error("Error parsing oldImages", e);
        }
    }

    // Xử lý upload ảnh mới
    if (req.files && req.files.images) {
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        for (let i = 0; i < files.length; i++) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "products" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(files[i].data);
            });

            images.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
    }

    req.body.images = images;

    if (req.body.sizes && !Array.isArray(req.body.sizes)) req.body.sizes = [req.body.sizes];
    if (req.body.colors && !Array.isArray(req.body.colors)) req.body.colors = [req.body.colors];


    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        success: true,
        product
    })
}
// Xóa sản phẩm 
export const deteteProduct = handleAsyncError(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 404))
    }
    res.status(200).json({
        succes: true,
        message: " Xóa sản phẩm thành công"
    })
})

// truy cập sản phẩm đơn lẻ 
export const getSingleProduct = handleAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 404))
    }
    res.status(200).json({
        success: true,
        product
    })
})

// tạo và cập nhật đánh giá san phẩm 
export const createReviewProduct = handleAsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    const product = await Product.findById(productId)
    // console.log(product);

    const reviewExist = product.reviews.find(review => review.user.toString() === req.user._id.toString())
    if (reviewExist) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.rating = rating,
                    review.comment = comment
            }
        })
    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let sum = 0;
    product.reviews.forEach(review => {
        sum += review.rating
    })
    product.ratings = sum / product.reviews.length

    await product.save({ validateBeforeSave: false })
    res.status(200).json({
        succes: true,
        message: reviewExist ? "Cập nhật đánh giá thành công!" : "Thêm đánh giá thành công",
        product
    })


})

// lấy đánh giá sản phẩm 
export const getReviewProduct = handleAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id)
    if (!product) {
        return next(new HandleError("Sản phẩn không tồn tại", 400))
    }
    res.status(200).json({
        succes: true,
        review: product.reviews
    })
})

//  xóa đánh giá sản phẩm 

export const deleteReviewProduct = handleAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)
    if (!product) {
        return next(new HandleError("Không tìm thấy id sản phẩm", 400))
    }
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString())
    let sum = 0
    reviews.forEach(review => {
        sum += review.rating
    })
    const ratings = reviews.length > 0 ? sum / reviews.length : 0;
    const numOfReviews = reviews.length
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true
    })



    res.status(200).json({
        success: true,
        message: "Xóa thành công đánh giá sản phẩm"
    })
})

// Admin - lấy tất cả sản phẩm 
export const getAdminProducts = handleAsyncError(async (req, res, next) => {
    const products = await Product.find()
    res.status(200).json({
        succes: true,
        products
    })
})

// =============================================
// Admin - Import sản phẩm hàng loạt từ Excel/CSV
// POST /api/v1/admin/products/import
// =============================================
export const importProducts = handleAsyncError(async (req, res, next) => {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return next(new HandleError("Danh sách sản phẩm trống", 400));
    }

    const imported = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
        const item = products[i];
        try {
            // Validate required fields
            if (!item.name || !item.name.trim()) {
                errors.push({ row: i + 1, name: item.name || '', message: 'Thiếu trường name' });
                continue;
            }
            if (!item.description || !item.description.trim()) {
                errors.push({ row: i + 1, name: item.name, message: 'Thiếu trường description' });
                continue;
            }
            if (item.price === undefined || item.price === null || isNaN(item.price) || Number(item.price) <= 0) {
                errors.push({ row: i + 1, name: item.name, message: 'Trường price không hợp lệ' });
                continue;
            }
            if (item.stock === undefined || item.stock === null || isNaN(item.stock) || Number(item.stock) < 0) {
                errors.push({ row: i + 1, name: item.name, message: 'Trường stock không hợp lệ' });
                continue;
            }
            if (!item.category || !item.category.trim()) {
                errors.push({ row: i + 1, name: item.name, message: 'Thiếu trường category' });
                continue;
            }

            // Parse sizes and colors from comma-separated string
            let sizes = item.sizes || [];
            if (typeof sizes === 'string') {
                sizes = sizes.split(',').map(s => s.trim()).filter(s => s);
            }

            let colors = item.colors || [];
            if (typeof colors === 'string') {
                colors = colors.split(',').map(c => c.trim()).filter(c => c);
            }

            // Create product with placeholder image
            const productData = {
                name: item.name.trim(),
                description: item.description.trim(),
                price: Number(item.price),
                originalPrice: Number(item.originalPrice) || 0,
                stock: Number(item.stock),
                category: item.category.trim(),
                brand: item.brand || 'No Brand',
                material: item.material || '',
                sizes,
                colors,
                images: [{
                    public_id: 'placeholder',
                    url: 'https://res.cloudinary.com/demo/image/upload/v1/placeholder.png'
                }],
                user: req.user.id
            };

            const product = await Product.create(productData);
            imported.push(product);
        } catch (err) {
            errors.push({ row: i + 1, name: item.name || '', message: err.message });
        }
    }

    res.status(200).json({
        success: true,
        imported: imported.length,
        failed: errors.length,
        errors,
        products: imported
    });
})

// =============================================
// Admin - Import tồn kho hàng loạt (cập nhật stock theo tên SP)
// PUT /api/v1/admin/products/import-stock
// =============================================
export const importStock = handleAsyncError(async (req, res, next) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return next(new HandleError("Danh sách nhập hàng trống", 400));
    }

    const updated = [];
    const notFound = [];

    for (const item of items) {
        if (!item.name || !item.quantity || isNaN(item.quantity) || Number(item.quantity) <= 0) {
            notFound.push({ name: item.name || '(trống)', reason: 'Tên hoặc số lượng không hợp lệ' });
            continue;
        }

        // Search by exact name (case-insensitive)
        const product = await Product.findOne({
            name: { $regex: `^${item.name.trim()}$`, $options: 'i' }
        });

        if (!product) {
            notFound.push({ name: item.name, reason: 'Không tìm thấy sản phẩm' });
            continue;
        }

        product.stock += Number(item.quantity);
        await product.save({ validateBeforeSave: false });
        updated.push({
            _id: product._id,
            name: product.name,
            oldStock: product.stock - Number(item.quantity),
            addedQty: Number(item.quantity),
            newStock: product.stock
        });
    }

    res.status(200).json({
        success: true,
        updated: updated.length,
        notFound,
        details: updated
    });
})

// =============================================
// Admin - Cập nhật tồn kho 1 sản phẩm
// PUT /api/v1/admin/products/:id/stock
// =============================================
export const updateStock = handleAsyncError(async (req, res, next) => {
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(quantity) || Number(quantity) <= 0) {
        return next(new HandleError("Số lượng nhập không hợp lệ", 400));
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new HandleError("Sản phẩm không tồn tại", 404));
    }

    product.stock += Number(quantity);
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        product
    });
})

// =============================================
// Admin - Tìm kiếm sản phẩm theo tên
// GET /api/v1/admin/products/search?name=áo
// =============================================
export const searchProducts = handleAsyncError(async (req, res, next) => {
    const { name } = req.query;

    if (!name || !name.trim()) {
        return next(new HandleError("Vui lòng nhập tên sản phẩm để tìm kiếm", 400));
    }

    const products = await Product.find({
        name: { $regex: name.trim(), $options: 'i' }
    }).select('_id name stock price category images');

    res.status(200).json({
        success: true,
        products
    });
})