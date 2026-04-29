const mongoose = require ("mongoose")

const connectDB = mongoose.connect(process.env.DB_URI)
.then(()=>{
  console.log("Database connected successfully");
  
})
.catch((err)=>{
  console.log(err);
 console.log( "error connecting to database");
 
  
})

module.exports= connectDB