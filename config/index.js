const mongoose =require('mongoose')
// const connect =() => {
//     mongoose.connect('mongodb://127.0.0.1:27017/BanHang',{
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// }

const connect = async() => {
    try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/BanHang')
    console.log("connect true");
    } catch (err) {
        console.error(err);
    }

}

module.exports = connect;