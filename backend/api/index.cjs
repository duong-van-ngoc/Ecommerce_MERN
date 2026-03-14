
let appPromise = null;
let initPromise = null;

module.exports = async function handler(req, res) {
  try {
    if (!appPromise) {
      // Sử dụng dynamic import để nạp các module ESM vào trong môi trường CommonJS
      appPromise = import("../app.js").then(m => m.default);
      initPromise = import("../config/bootstrap.js").then(m => m.initializeApp());
    }
    
    // Đợi Express app và khởi tạo DB/Cloudinary xong
    const [app] = await Promise.all([appPromise, initPromise]);
    
    // Giao request cho Express xử lý
    return app(req, res);
  } catch (error) {
    console.error("Vercel Function Error:", error);
    res.status(500).json({
      success: false,
      message: "Serverless Function Execution Error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      hint: "Check environment variables and build logs."
    });
  }
};
