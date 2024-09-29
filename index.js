const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3001;
cors = require("cors");

app.use(cors(
  {
    origin: "*",
    credentials: true
  }
));

app.get("/api", async (req, res) => {
  res.send("Test");
})

const { connect } = require("./config/Database");
connect();

app.use(morgan("dev"));

// admin
const adminMiddleware = require("./middlewares/verifyAdmin");

const adminUserRoutes = require("./routes/admin/userController");
app.use("/api/admin/user", adminMiddleware, adminUserRoutes);

const adminVendorRoutes = require("./routes/admin/vendorController");
app.use("/api/admin/vendor", adminMiddleware, adminVendorRoutes);

const adminCategoryRoutes = require("./routes/admin/categoryController");
app.use("/api/admin/category", adminMiddleware, adminCategoryRoutes);

const adminProductRoutes = require("./routes/admin/productController");
app.use("/api/admin/product", adminMiddleware, adminProductRoutes);

const adminDiscountRoutes = require("./routes/admin/discountController");
app.use("/api/admin/discount", adminMiddleware, adminDiscountRoutes);

const adminOrderRoutes = require("./routes/admin/orderController");
app.use("/api/admin/order", adminMiddleware, adminOrderRoutes);

const adminBrandRoutes = require("./routes/admin/brandController");
app.use("/api/admin/brand", adminMiddleware, adminBrandRoutes);

const adminRoleRoutes = require("./routes/admin/roleController");
app.use("/api/admin/role", adminMiddleware, adminRoleRoutes);

const adminHomepageRoutes = require("./routes/admin/websiteController");
app.use("/api/admin/homepage", adminMiddleware, adminHomepageRoutes);

const adminConfigRoutes = require("./routes/admin/configController");
app.use("/api/admin/config", adminMiddleware, adminConfigRoutes);


const riderRoutes = require("./routes/admin/riderController");
app.use("/api/admin/rider", adminMiddleware, riderRoutes);

const employeRoutes = require("./routes/admin/employeController");
app.use("/api/admin/employe", adminMiddleware, employeRoutes);

const locationtypeRoutes = require("./routes/admin/locationtypeController");
app.use("/api/admin/locationtype", adminMiddleware, locationtypeRoutes);

const locationRoutes = require("./routes/admin/locationlistController");
app.use("/api/admin/location", adminMiddleware, locationRoutes);


const attendenceRoutes = require("./routes/admin/attendenceController");
app.use("/api/admin/attendence", adminMiddleware, attendenceRoutes);

const schedulesRoutes = require("./routes/admin/scheduleeController");
app.use("/api/admin/schedule", adminMiddleware, schedulesRoutes);


const confirmationRoutes = require("./routes/admin/confirmationController");
app.use("/api/admin/call", adminMiddleware, confirmationRoutes);







// user
const userMiddleware = require("./middlewares/verifyUser");

const userAuthRoutes = require("./routes/user/authController");
app.use("/api/auth", userAuthRoutes);

const userUserRoutes = require("./routes/user/userController");
app.use("/api/user", userMiddleware, userUserRoutes);

const userCategoryRoutes = require("./routes/user/categoryController");
app.use("/api/category", userCategoryRoutes);

const userProductRoutes = require("./routes/user/productController");
app.use("/api/product", userProductRoutes);

const userOrderRoutes = require("./routes/user/orderController");
app.use("/api/order", userMiddleware, userOrderRoutes);

const userBrandRoutes = require("./routes/user/brandController");
app.use("/api/brand", userBrandRoutes);

const userVendorRoutes = require("./routes/user/vendorController");
app.use("/api/vendor", userVendorRoutes);

const userReviewRoutes = require("./routes/user/reviewController");
app.use("/api/review", userMiddleware, userReviewRoutes);

const userDiscountRoutes = require("./routes/user/discountController");
app.use("/api/discount", userDiscountRoutes);

// vendor
const vendorMiddleware = require("./middlewares/verifyVendor");

const vendorRegisterRoutes = require("./routes/vendor/signupController");
app.use("/api/vendor/register", vendorRegisterRoutes);

const vendorProductRoutes = require("./routes/vendor/productController");
app.use("/api/vendor/product", vendorMiddleware, vendorProductRoutes);

const vendorOrderRoutes = require("./routes/vendor/orderController");
app.use("/api/vendor/order", vendorMiddleware, vendorOrderRoutes);

const vendorHomepageRoutes = require("./routes/vendor/websiteController");
app.use("/api/vendor/homepage", vendorMiddleware, vendorHomepageRoutes);

// Rider







// website
const homepageRoutes = require("./routes/website/homepageController");
app.use("/api/website/homepage", homepageRoutes);

const websiteVendorRoutes = require("./routes/website/vendorController");
app.use("/api/website/vendor", websiteVendorRoutes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
