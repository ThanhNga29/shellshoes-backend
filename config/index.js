const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
// const connect =() => {
//     mongoose.connect('mongodb://127.0.0.1:27017/BanHang',{
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// }

// const connect = async() => {
//     try {
//     const conn = await mongoose.connect('mongodb://127.0.0.1:27017/BanHang')
//     console.log("connect true");
//     } catch (err) {
//         console.error(err);
//     }

// }
const connect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('err', err.message);
    }
};

//module.exports = connect;

module.exports = connect;
