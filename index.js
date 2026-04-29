
const express = require("express")
const app = express()
const mongoose= require("mongoose")
const cors = require("cors")
app.set("view engine", "ejs")
const dotenv = require("dotenv")
dotenv.config()
app.use(express.urlencoded({extended:true}))
app.use(express.json({limit:"50mb"}))
app.use(cors())

mongoose.connect(process.env.DB_URI)
.then(()=>{
  console.log("Database connected successfully");
  
})
.catch((err)=>{
  console.log(err);
 console.log( "error connecting to database");
 
  
})




const UserRouter = require("./routers/user.routes")
app.use("/api/v1", UserRouter)


let products =[
    {
      "productName": "Wireless Mouse",
      "productPrice": 29.99,
      "productCategory": "Electronics",
      "productQuantity": 150
    },
    {
      "productName": "Cotton T-Shirt",
      "productPrice": 19.95,
      "productCategory": "Apparel",
      "productQuantity": 320
    },
    {
      "productName": "Stainless Steel Water Bottle",
      "productPrice": 15.50,
      "productCategory": "Kitchenware",
      "productQuantity": 85
    },
    {
      "productName": "Yoga Mat",
      "productPrice": 25.00,
      "productCategory": "Sports",
      "productQuantity": 210
    },
    {
      "productName": "Desk Lamp",
      "productPrice": 42.30,
      "productCategory": "Home Decor",
      "productQuantity": 47
    },
    {
      "productName": "Noise Cancelling Headphones",
      "productPrice": 89.99,
      "productCategory": "Electronics",
      "productQuantity": 63
    },
    {
      "productName": "Ceramic Coffee Mug",
      "productPrice": 12.75,
      "productCategory": "Kitchenware",
      "productQuantity": 500
    },
    {
      "productName": "Running Shoes",
      "productPrice": 65.00,
      "productCategory": "Footwear",
      "productQuantity": 112
    },
    {
      "productName": "Backpack",
      "productPrice": 49.99,
      "productCategory": "Accessories",
      "productQuantity": 78
    },
    {
      "productName": "Scented Candle",
      "productPrice": 18.40,
      "productCategory": "Home Decor",
      "productQuantity": 205
    }
  ]
// app.get(Path, callback)
app.get("/", (req, res)=>{
    // res.send("Application working fine")
    let person = {
        fullName:"Pam Pam",
        course:"Software",
        gender:"male",
        complexion:"caramel"
    }
    // res.send(person)


    console.log(__dirname+"/index.html");
    res.sendFile(__dirname+"/index.html")
})


app.get("/user", (req, res)=>{
    res.redirect("/")
})

app.get("/index", (req, res)=>{
    res.render("index", {products})
})




app.post("/delete/:id", (req, res)=>{
    const {id} = req.params

    console.log(id);

    products.splice(id, 1);

    res.render("index", {products})
    
})


app.get("/edit/:id", (req, res)=>{
    const {id} = req.params

    res.render("editProduct")
})

app.post("/edit/:id", (req, res)=>{
  const{id}= req.params

  products.splice(id, 1, req.body)
  res.render("index", {products, })
})

app.get("/addProduct", (req, res)=>{
    res.render("addProduct")
})

app.post("/addProduct", (req, res)=>{
    console.log(req.body);

    products.push(req.body)

    res.render("index", {products, })
    
})


// app.listen(port, callback)

app.listen(process.env.PORT, (err)=>{
    if(err){
        console.log("Server cannot start");
        
    }else{
        console.log(`Server started on port ${process.env.PORT}`);
        
    }
})