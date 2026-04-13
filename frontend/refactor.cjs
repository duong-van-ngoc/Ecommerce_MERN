const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

const mappings = {
    "src/App.jsx": "src/app/App.jsx",
    "src/main.jsx": "src/app/main.jsx",
    "src/index.css": "src/app/styles/index.css",
    "src/global-hover.css": "src/app/styles/global-hover.css",
    "src/api/apiAdress.js": "src/shared/api/apiAddress.js",
    "src/api/http.js": "src/shared/api/http.js",
    "src/components/AccountSidebar.jsx": "src/shared/components/AccountSidebar.jsx",
    "src/components/CategoryGrid.jsx": "src/shared/components/CategoryGrid.jsx",
    "src/components/Footer.jsx": "src/shared/components/Footer.jsx",
    "src/components/HeroSection.jsx": "src/shared/components/HeroSection.jsx",
    "src/components/ImageSlider.jsx": "src/shared/components/ImageSlider.jsx",
    "src/components/Loader.jsx": "src/shared/components/Loader.jsx",
    "src/components/Navbar.jsx": "src/shared/components/Navbar.jsx",
    "src/components/NewArrivals.jsx": "src/shared/components/NewArrivals.jsx",
    "src/components/NoProducts.jsx": "src/shared/components/NoProducts.jsx",
    "src/components/PageTitle.jsx": "src/shared/components/PageTitle.jsx",
    "src/components/Pagination.jsx": "src/shared/components/Pagination.jsx",
    "src/components/Product.jsx": "src/shared/components/Product.jsx",
    "src/components/ProtectedRoute.jsx": "src/shared/components/ProtectedRoute.jsx",
    "src/components/Rating.jsx": "src/shared/components/Rating.jsx",
    "src/components/RelatedProductsSection.jsx": "src/shared/components/RelatedProductsSection.jsx",
    "src/components/layout/AIChatBubble.jsx": "src/features/chat/components/AIChatBubble.jsx",
    "src/componentStyles/AccountSidebar.css": "src/shared/components/styles/AccountSidebar.css",
    "src/componentStyles/CategoryGrid.css": "src/shared/components/styles/CategoryGrid.css",
    "src/componentStyles/Filters.css": "src/shared/components/styles/Filters.css",
    "src/componentStyles/Footer.css": "src/shared/components/styles/Footer.css",
    "src/componentStyles/HeroSection.css": "src/shared/components/styles/HeroSection.css",
    "src/componentStyles/ImageSlider.css": "src/shared/components/styles/ImageSlider.css",
    "src/componentStyles/Loader.css": "src/shared/components/styles/Loader.css",
    "src/componentStyles/Navbar.css": "src/shared/components/styles/Navbar.css",
    "src/componentStyles/NewArrivals.css": "src/shared/components/styles/NewArrivals.css",
    "src/componentStyles/NoProducts.css": "src/shared/components/styles/NoProducts.css",
    "src/componentStyles/Pagination.css": "src/shared/components/styles/Pagination.css",
    "src/componentStyles/Product.css": "src/shared/components/styles/Product.css",
    "src/componentStyles/Rating.css": "src/shared/components/styles/Rating.css",
    "src/componentStyles/RelatedProductsSection.css": "src/shared/components/styles/RelatedProductsSection.css",
    "src/constants/aiSettings.js": "src/shared/constants/aiSettings.js",
    "src/constants/categories.js": "src/shared/constants/categories.js",
    "src/utils/formatCurrency.js": "src/shared/utils/formatCurrency.js",
    "src/utils/formatDate.js": "src/shared/utils/formatDate.js",
    "src/admin/pages/Dashboard.jsx": "src/pages/admin/Dashboard.jsx",
    "src/admin/pages/OrdersManagement.jsx": "src/pages/admin/OrdersManagement.jsx",
    "src/admin/pages/ProductsManagement.jsx": "src/pages/admin/ProductsManagement.jsx",
    "src/admin/pages/Settings.jsx": "src/pages/admin/Settings.jsx",
    "src/admin/pages/UsersManagement.jsx": "src/pages/admin/UsersManagement.jsx",
    "src/admin/pages/VouchersManagement.jsx": "src/pages/admin/VouchersManagement.jsx",
    "src/admin/styles/AdminLayout.css": "src/pages/admin/styles/AdminLayout.css",
    "src/admin/styles/Dashboard.css": "src/pages/admin/styles/Dashboard.css",
    "src/admin/styles/ImportProductModal.css": "src/pages/admin/styles/ImportProductModal.css",
    "src/admin/styles/OrdersManagement.css": "src/pages/admin/styles/OrdersManagement.css",
    "src/admin/styles/ProductFormModal.css": "src/pages/admin/styles/ProductFormModal.css",
    "src/admin/styles/ProductsManagement.css": "src/pages/admin/styles/ProductsManagement.css",
    "src/admin/styles/Settings.css": "src/pages/admin/styles/Settings.css",
    "src/admin/styles/StockManagement.css": "src/pages/admin/styles/StockManagement.css",
    "src/admin/styles/UserDetailModal.css": "src/pages/admin/styles/UserDetailModal.css",
    "src/admin/styles/UsersManagement.css": "src/pages/admin/styles/UsersManagement.css",
    "src/admin/styles/VouchersManagement.css": "src/pages/admin/styles/VouchersManagement.css",
    "src/AdminStyles/CreateProduct.css": "src/pages/admin/styles/CreateProduct.css",
    "src/AdminStyles/Dashboard.css": "src/pages/admin/styles/Legacy_Dashboard.css",
    "src/AdminStyles/OrdersList.css": "src/pages/admin/styles/OrdersList.css",
    "src/AdminStyles/ProductsList.css": "src/pages/admin/styles/ProductsList.css",
    "src/AdminStyles/ReviewsList.css": "src/pages/admin/styles/ReviewsList.css",
    "src/AdminStyles/UpdateOrder.css": "src/pages/admin/styles/UpdateOrder.css",
    "src/AdminStyles/UpdateProduct.css": "src/pages/admin/styles/UpdateProduct.css",
    "src/AdminStyles/UpdateRole.css": "src/pages/admin/styles/UpdateRole.css",
    "src/AdminStyles/UsersList.css": "src/pages/admin/styles/UsersList.css",
    "src/Pages/Home.jsx": "src/pages/public/Home.jsx",
    "src/Pages/ProductDetails.jsx": "src/pages/public/ProductDetails.jsx",
    "src/Pages/Products.jsx": "src/pages/public/Products.jsx",
    "src/Pages/VnpayResult.jsx": "src/pages/checkout/VnpayResult.jsx",
    "src/pageStyles/Home.css": "src/pages/public/styles/Home.css",
    "src/pageStyles/ProductDetails.css": "src/pages/public/styles/ProductDetails.css",
    "src/pageStyles/Products.css": "src/pages/public/styles/Products.css",
    "src/pageStyles/Search.css": "src/pages/public/styles/Search.css",
    "src/User/ForgotPassword.jsx": "src/pages/auth/ForgotPassword.jsx",
    "src/User/Login.jsx": "src/pages/auth/Login.jsx",
    "src/User/LoginSuccess.jsx": "src/pages/auth/LoginSuccess.jsx",
    "src/User/Register.jsx": "src/pages/auth/Register.jsx",
    "src/User/ResetPassword.jsx": "src/pages/auth/ResetPassword.jsx",
    "src/User/Notifications.jsx": "src/pages/user/Notifications.jsx",
    "src/User/Profile.jsx": "src/pages/user/Profile.jsx",
    "src/User/UpdatePassword.jsx": "src/pages/user/UpdatePassword.jsx",
    "src/User/UpdateProfile.jsx": "src/pages/user/UpdateProfile.jsx",
    "src/User/UserDashboard.jsx": "src/pages/user/UserDashboard.jsx",
    "src/User/Vouchers.jsx": "src/pages/user/Vouchers.jsx",
    "src/UserStyles/ForgotPassword.css": "src/pages/auth/styles/ForgotPassword.css",
    "src/UserStyles/Form.css": "src/pages/auth/styles/Form.css",
    "src/UserStyles/Login.css": "src/pages/auth/styles/Login.css",
    "src/UserStyles/Register.css": "src/pages/auth/styles/Register.css",
    "src/UserStyles/Notifications.css": "src/pages/user/styles/Notifications.css",
    "src/UserStyles/Profile.css": "src/pages/user/styles/Profile.css",
    "src/UserStyles/UpdateProfile.css": "src/pages/user/styles/UpdateProfile.css",
    "src/UserStyles/UserDashboard.css": "src/pages/user/styles/UserDashboard.css",
    "src/UserStyles/Vouchers.css": "src/pages/user/styles/Vouchers.css",
    "src/Cart/Cart.jsx": "src/pages/checkout/Cart.jsx",
    "src/Cart/CheckoutPath.jsx": "src/pages/checkout/CheckoutPath.jsx",
    "src/Cart/OrderConfirm.jsx": "src/pages/checkout/OrderConfirm.jsx",
    "src/Cart/Payment.jsx": "src/pages/checkout/Payment.jsx",
    "src/Cart/Shipping.jsx": "src/pages/checkout/Shipping.jsx",
    "src/Cart/OrderSuccess.jsx": "src/pages/checkout/OrderSuccess.jsx",
    "src/CartStyles/Cart.css": "src/pages/checkout/styles/Cart.css",
    "src/CartStyles/CheckoutPath.css": "src/pages/checkout/styles/CheckoutPath.css",
    "src/CartStyles/OrderConfirm.css": "src/pages/checkout/styles/OrderConfirm.css",
    "src/CartStyles/Payment.css": "src/pages/checkout/styles/Payment.css",
    "src/CartStyles/PaymentSuccess.css": "src/pages/checkout/styles/PaymentSuccess.css",
    "src/CartStyles/Shipping.css": "src/pages/checkout/styles/Shipping.css",
    "src/CartStyles/OrderSuccess.css": "src/pages/checkout/styles/OrderSuccess.css",
    "src/Cart/MyOrders.jsx": "src/pages/orders/MyOrders.jsx",
    "src/Cart/OrderDetails.jsx": "src/pages/orders/OrderDetails.jsx",
    "src/Cart/CancelOrderModal.jsx": "src/pages/orders/CancelOrderModal.jsx",
    "src/Cart/ReviewComment.jsx": "src/pages/orders/ReviewComment.jsx",
    "src/CartStyles/MyOrders.css": "src/pages/orders/styles/MyOrders.css",
    "src/OrderStyles/MyOrders.css": "src/pages/orders/styles/Legacy_MyOrders.css",
    "src/OrderStyles/OrderDetails.css": "src/pages/orders/styles/OrderDetails.css",
    "src/CartStyles/CancelOrderModal.css": "src/pages/orders/styles/CancelOrderModal.css",
    "src/CartStyles/ReviewComment.css": "src/pages/orders/styles/ReviewComment.css",
    "src/Cart/CartItem.jsx": "src/features/cart/components/CartItem.jsx",
    "src/Cart/CartAction.jsx": "src/features/cart/components/CartAction.jsx",
    
    // Also, index.html might need app/main.jsx if it changes
};

function getFiles(dir, exts, list = []) {
    if (!fs.existsSync(dir)) return list;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) {
            getFiles(fp, exts, list);
        } else if (exts.includes(path.extname(f))) {
            list.push(fp);
        }
    }
    return list;
}

const allSrcFiles = getFiles(srcDir, ['.js', '.jsx', '.css']);

const pathToAlias = {};
for (const f of allSrcFiles) {
    const relFromRoot = path.relative(path.resolve(__dirname), f).replace(/\\/g, '/');
    let finalRel = mappings[relFromRoot] || relFromRoot; 
    let aliasPath = finalRel.startsWith("src/") ? "@/" + finalRel.substring(4) : finalRel;
    
    const ext = path.extname(aliasPath);
    let aliasWithoutExt = aliasPath;
    if (ext === '.js' || ext === '.jsx') {
        aliasWithoutExt = aliasPath.replace(new RegExp(`\\${ext}$`), '');
    }
    
    const oldExt = path.extname(f);
    const oldAbsExtLess = f.replace(new RegExp(`\\${oldExt}$`), '');
    
    // Use lowercased path lookup for Windows safety (Windows is case-insensitive, but our strings might differ slightly if referenced loosely)
    pathToAlias[oldAbsExtLess.toLowerCase()] = aliasWithoutExt;
    pathToAlias[f.toLowerCase()] = aliasPath; 
}

const changes = {};
// Add style/css @import matching
const importRegex = /(?:import\s+.*?(?:from\s+)?['"]([^'"]+)['"])|(?:import\s+['"]([^'"]+)['"])/g;

for (const f of allSrcFiles) {
    let content = fs.readFileSync(f, 'utf8');
    let hasChanges = false;
    
    content = content.replace(importRegex, (match, path1, path2) => {
        const importPath = path1 || path2;
        if (!importPath || !importPath.startsWith('.')) return match;
        
        const fileDir = path.dirname(f);
        const resolvedPath = path.resolve(fileDir, importPath).toLowerCase();
        
        let targetAlias = null;
        
        if (pathToAlias[resolvedPath]) targetAlias = pathToAlias[resolvedPath];
        else if (pathToAlias[resolvedPath + '.jsx']) targetAlias = pathToAlias[resolvedPath + '.jsx'];
        else if (pathToAlias[resolvedPath + '.js']) targetAlias = pathToAlias[resolvedPath + '.js'];
        else if (pathToAlias[resolvedPath + '/index.js']) targetAlias = pathToAlias[resolvedPath + '/index.js'];
        else if (pathToAlias[resolvedPath + '/index.jsx']) targetAlias = pathToAlias[resolvedPath + '/index.jsx'];
        
        if (targetAlias) {
            hasChanges = true;
            return match.replace(importPath, targetAlias);
        }
        
        return match;
    });
    
    if (hasChanges) {
        changes[f] = content;
    }
}

for (const [f, newContent] of Object.entries(changes)) {
    fs.writeFileSync(f, newContent, 'utf8');
}

for (const [oldRel, newRel] of Object.entries(mappings)) {
    const fullOld = path.join(__dirname, oldRel);
    const fullNew = path.join(__dirname, newRel);
    
    if (fs.existsSync(fullOld)) {
        const newDir = path.dirname(fullNew);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }
        fs.renameSync(fullOld, fullNew);
    }
}

// Special case for index.html referencing src/main.jsx
const idxHtmlPath = path.join(__dirname, 'index.html');
if (fs.existsSync(idxHtmlPath)) {
    let html = fs.readFileSync(idxHtmlPath, 'utf8');
    if (html.includes('src/main.jsx')) {
        fs.writeFileSync(idxHtmlPath, html.replace('src/main.jsx', 'src/app/main.jsx'), 'utf8');
    }
}

console.log("Refactoring complete! Imports mapped and files moved.");
