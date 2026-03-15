
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


    if (typeof req.body.category === 'string') {
        try {
            req.body.category = JSON.parse(req.body.category);
        } catch (error) {
            // Nếu không phải JSON hợp lệ (ví dụ form gửi lên string thường - trường hợp cũ), 
            // có thể xử lý lỗi hoặc gán tạm giá trị. Ở đây mô hình mới bắt buộc Object.
            return next(new HandleError("Dữ liệu category không hợp lệ, vui lòng gửi dạng Object {level1, level2, level3}", 400));
        }
    }

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

    if (typeof req.body.category === 'string') {
        try {
            req.body.category = JSON.parse(req.body.category);
        } catch (error) {
            return next(new HandleError("Dữ liệu category không hợp lệ, vui lòng gửi dạng Object {level1, level2, level3}", 400));
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

import * as xlsx from 'xlsx';

// =============================================
// Admin - Import sản phẩm hàng loạt từ Excel/CSV
// POST /api/v1/admin/products/import
// =============================================
export const importProducts = handleAsyncError(async (req, res, next) => {
    let products = [];
    
    // Check if a file was uploaded
    if (req.files && req.files.file) {
        const file = req.files.file;
        
        try {
            // Check file type (optional, but good practice)
            // const ext = file.name.split('.').pop().toLowerCase();
            // if (!['xlsx', 'xls', 'csv'].includes(ext)) { ... }

            // Read the file data into a workbook
            const workbook = xlsx.read(file.data, { type: 'buffer' });
            
            // Assuming data is in the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON array
            products = xlsx.utils.sheet_to_json(worksheet, { defval: '' }); // defval maps empty cells to empty strings
            
        } catch (error) {
            return next(new HandleError(`Lỗi đọc file: ${error.message}`, 400));
        }
    } else if (req.body.products) {
        // Fallback for direct JSON array
        try {
            products = typeof req.body.products === 'string' ? JSON.parse(req.body.products) : req.body.products;
        } catch (error) {
           return next(new HandleError("Dữ liệu JSON products không hợp lệ", 400));
        }
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
        return next(new HandleError("Không tìm thấy dữ liệu sản phẩm trong file hoặc request", 400));
    }

    const imported = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
        // Handle variations in column names from Excel/CSV
        // We will try to map common Vietnamese/English headers to our schema fields
        const rawItem = products[i];
        
        // Define mapping functions to handle potential header variations
        const getValue = (keys) => {
            for (const key of keys) {
                if (rawItem[key] !== undefined && rawItem[key] !== null && rawItem[key] !== '') {
                    return rawItem[key];
                }
            }
            return null;
        };

        const item = {
            name: getValue(['Tên', 'Tên sản phẩm', 'Name', 'name']),
            description: getValue(['Mô Tả', 'Mô tả', 'Description', 'description']),
            price: getValue(['Giá Bán', 'Giá bán', 'Price', 'price']),
            originalPrice: getValue(['Giá Gốc', 'Giá gốc', 'Original Price', 'originalPrice']),
            stock: getValue(['Tồn Kho', 'Tồn kho', 'Số lượng', 'Stock', 'stock']),
            categoryLevel1: getValue(['Danh Mục Cấp 1', 'Danh mục cấp 1', 'Category Level 1', 'level1']),
            categoryLevel2: getValue(['Danh Mục Cấp 2', 'Danh mục cấp 2', 'Category Level 2', 'level2']),
            categoryLevel3: getValue(['Danh Mục Cấp 3', 'Danh mục cấp 3', 'Category Level 3', 'level3']),
            brand: getValue(['Thương Hiệu', 'Thương hiệu', 'Brand', 'brand']),
            material: getValue(['Chất Liệu', 'Chất liệu', 'Material', 'material']),
            sizes: getValue(['Sizes', 'Cỡ', 'Kích cỡ', 'sizes']),
            colors: getValue(['Colors', 'Màu sắc', 'colors']),
        };

        try {
            // Validate required fields
            if (!item.name || !String(item.name).trim()) {
                errors.push({ row: i + 2, name: item.name || '', message: 'Thiếu trường Tên (name)' }); // i+2 because row 1 is usually header in Excel
                continue;
            }
            if (!item.description || !String(item.description).trim()) {
                errors.push({ row: i + 2, name: item.name, message: 'Thiếu trường Mô tả (description)' });
                continue;
            }
            if (item.price === null || isNaN(item.price) || Number(item.price) <= 0) {
                errors.push({ row: i + 2, name: item.name, message: 'Trường Giá bán (price) không hợp lệ' });
                continue;
            }
            if (item.stock === null || isNaN(item.stock) || Number(item.stock) < 0) {
                errors.push({ row: i + 2, name: item.name, message: 'Trường Tồn kho (stock) không hợp lệ' });
                continue;
            }
            if (!item.categoryLevel1 || !item.categoryLevel2 || !item.categoryLevel3) {
                // Check fallback to old 'category' field if new ones are missing
                 const oldCategory = getValue(['Danh mục', 'Category', 'category']);
                 if(oldCategory) {
                    errors.push({ row: i + 2, name: item.name, message: 'File mẫu cũ. Cần cập nhật sang 3 cột Danh Mục Cấp 1, 2, 3.' });
                 } else {
                    errors.push({ row: i + 2, name: item.name, message: 'Thiếu thông tin Danh mục cấp 1/2/3' });
                 }
                continue;
            }

            // Parse sizes and colors from comma-separated string
            let sizes = item.sizes || [];
            if (typeof sizes === 'string' || typeof sizes === 'number') {
                sizes = String(sizes).split(',').map(s => s.trim()).filter(s => s);
            } else if (!Array.isArray(sizes)) {
                sizes = [];
            }

            let colors = item.colors || [];
            if (typeof colors === 'string') {
                colors = colors.split(',').map(c => c.trim()).filter(c => c);
            } else if (!Array.isArray(colors)) {
                colors = [];
            }

            // Create product with placeholder image
            const productData = {
                name: String(item.name).trim(),
                description: String(item.description).trim(),
                price: Number(item.price),
                originalPrice: Number(item.originalPrice) || 0,
                stock: Number(item.stock),
                category: {
                    level1: String(item.categoryLevel1).trim(),
                    level2: String(item.categoryLevel2).trim(),
                    level3: String(item.categoryLevel3).trim(),
                },
                brand: item.brand ? String(item.brand).trim() : 'No Brand',
                material: item.material ? String(item.material).trim() : '',
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
            errors.push({ row: i + 2, name: item.name || '', message: err.message });
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
// Admin - Cập nhật sản phẩm hàng loạt từ Excel/CSV
// PUT /api/v1/admin/products/update-bulk
// =============================================
export const updateProductsBulk = handleAsyncError(async (req, res, next) => {
    let products = [];
    
    // Check if a file was uploaded
    if (req.files && req.files.file) {
        const file = req.files.file;
        try {
            const workbook = xlsx.read(file.data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            products = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
        } catch (error) {
            return next(new HandleError(`Lỗi đọc file: ${error.message}`, 400));
        }
    } else if (req.body.products) {
        try {
            products = typeof req.body.products === 'string' ? JSON.parse(req.body.products) : req.body.products;
        } catch (error) {
           return next(new HandleError("Dữ liệu JSON products không hợp lệ", 400));
        }
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
        return next(new HandleError("Không tìm thấy dữ liệu sản phẩm trong file hoặc request", 400));
    }

    const updated = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
        const rawItem = products[i];
        const getValue = (keys) => {
            for (const key of keys) {
                if (rawItem[key] !== undefined && rawItem[key] !== null && rawItem[key] !== '') {
                    return rawItem[key];
                }
            }
            return null;
        };

        const id = getValue(['Product ID', '_id', 'ID', 'Id', 'id']);
        const name = getValue(['Tên', 'Tên sản phẩm', 'Name', 'name']);

        if (!id) {
            errors.push({ row: i + 2, name: name || 'Không rõ', message: 'Thiếu trường ID sản phẩm (Product ID)' });
            continue;
        }

        const product = await Product.findById(id);
        if(!product) {
            errors.push({ row: i + 2, name: name || id, message: `Không tìm thấy sản phẩm có ID: ${id}` });
            continue;
        }

        const updateData = {};
        
        const price = getValue(['Giá Bán', 'Giá bán', 'Price', 'price']);
        if(price !== null && !isNaN(price)) updateData.price = Number(price);

        const originalPrice = getValue(['Giá Gốc', 'Giá gốc', 'Original Price', 'originalPrice']);
        if(originalPrice !== null && !isNaN(originalPrice)) updateData.originalPrice = Number(originalPrice);

        const stock = getValue(['Tồn Kho', 'Tồn kho', 'Số lượng', 'Stock', 'stock']);
        if(stock !== null && !isNaN(stock)) updateData.stock = Number(stock);

        const desc = getValue(['Mô Tả', 'Mô tả', 'Description', 'description']);
        if(desc) updateData.description = String(desc).trim();

        const pName = getValue(['Tên', 'Tên sản phẩm', 'Name', 'name']);
        if(pName) updateData.name = String(pName).trim();

        const catL1 = getValue(['Danh Mục Cấp 1', 'Danh mục cấp 1', 'Category Level 1', 'level1']);
        const catL2 = getValue(['Danh Mục Cấp 2', 'Danh mục cấp 2', 'Category Level 2', 'level2']);
        const catL3 = getValue(['Danh Mục Cấp 3', 'Danh mục cấp 3', 'Category Level 3', 'level3']);
        
        if (catL1 || catL2 || catL3) {
             updateData.category = {
                 level1: String(catL1 || product.category.level1).trim(),
                 level2: String(catL2 || product.category.level2).trim(),
                 level3: String(catL3 || product.category.level3).trim(),
             }
        }

        try {
           const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
               new: true,
               runValidators: true,
           });
           updated.push(updatedProduct);
        } catch (err) {
            errors.push({ row: i + 2, name: pName || id, message: err.message });
        }
    }

    res.status(200).json({
        success: true,
        updated: updated.length,
        failed: errors.length,
        errors,
        products: updated
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