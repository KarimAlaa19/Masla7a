
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./images/");
  },
  filename: (req, file, callback) => {
    
    callback(null, file.originalname);
  },
});
// const fileFilter = (req, file, cb)=>{
//   if(
//     file.mimetype === 'images/png' ||
//     file.mimetype === 'images/jpg' ||
//     file.mimetype === 'images/jpeg' 
//   ){
//     cb(null,true);
//   }
//   else{
//     cb(null,false);
//   }
// }
module.exports = multer({ storage: storage}).any();
