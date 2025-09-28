// hàm xử lý lỗi bất đồng bộ trong express
export default(myErrorFun) => (req, res, next) =>  {
    Promise.resolve(myErrorFun(req, res, next)).catch(next);
    
}