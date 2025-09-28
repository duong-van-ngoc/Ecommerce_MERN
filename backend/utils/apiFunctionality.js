
class APIFunctionality {
    // 
    constructor(query, queryStr) {
        this.query = query; // 
        this.queryStr = queryStr; //

    } 
    // search  tìm kiếmt theo từ khóa
    search() {
        // nếu có từ khóa thì tạo object tìm kiếm theo tên 
        const keyword = this.queryStr.keyword ? { // từ khóa người dùng gửi lên URl 
            name: {
                $regex: this.queryStr.keyword, // tìm kiếm theo từ khóa
                $options: "i" // không phân biệt chữ hoa chữ thường
            }
        } : {};
        console.log(keyword);
        
        // gắn điều kiện tìm kiếm vào query của mongoDB
        this.query = this.query.find({...keyword});

        return this;
    }
    // filter   lọc  chi tiết các sản phảm 

    filter() {
        const queryCopy = {...this.queryStr};
        // xóa các field ko cần thiết  khỏi queryCopy
                 console.log(queryCopy);

        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(key=>delete queryCopy[key])

        this.query = this.query.find(queryCopy)
        return this;
    }
     // pagination  phân trang kết quả 
    pagination(resultPerPage) { 
        const currentPage = Number(this.queryStr.page ) || 1  
        const skip= resultPerPage * ( currentPage - 1) 
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}
   


export default APIFunctionality;