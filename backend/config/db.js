import mongoose from "mongoose";


// khoi tao ham  ket noi database
const connectMongoDatabase = async  () => { 
        mongoose.connect(process.env.DB_URI).then((data) => {
            console.log(`kết nối cơ sở dữ liệu thành công với ${data.connection.host}`);
        })
    }
export default connectMongoDatabase;