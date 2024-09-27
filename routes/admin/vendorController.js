const express = require("express")
const router = express.Router()
const Vendor = require("../../models/Vendor")
const bycrypt = require("bcryptjs")
const Product = require("../../models/Product")
const VendorCategory = require("../../models/VendorCategory")
const upload = require("../../helper/multerUpload")
const User = require("../../models/User")
const emailValidation = require("../../helper/fieldValidation").emailValidation

router.get("/get-vendors", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)
        const total = await Vendor.countDocuments({ type: "vendor", status: { $ne: "deleted" } })
        const hasNextPage = (skip + parseInt(limit)) < total


        let filters = {
            status: { $ne: "deleted" }
        }

        if (req.query.vendorcategory)
            filters.vendorCategory = req.query.vendorcategory

        const vendors = await Vendor.find(filters).select('-password').sort({ date: -1 }).limit(limit).skip(skip)
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({ vendors, pagination: paginationObj })
    } catch (error) {
        console.log("Error fetching vendors: ", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get("/get-vendors/:id", async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id).select('-password').populate("vendorCategory")
        if (!vendor) return res.status(404).json({ message: "Vendor not found" })
        res.status(200).json(vendor)
    } catch (error) {
        console.log("Error fetching vendor: ", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post("/create-vendor", upload.upload.single('image') ,async (req, res) => {
    try {
        let { name, email, password, phone, shopUrl, vendorCategory, featured, shopName, shopAddress } = req.body
        if (!name || !email || !password || !phone || !shopName || !shopAddress) return res.status(400).json({ message: "All fields are required" })
        email = email.toLowerCase()
        if (!emailValidation(email)) return res.status(400).json({ message: "Invalid email format" })
        const emailExists = await Vendor.findOne({ email: email, type: "vendor" })
        const phoneExists = await Vendor.findOne({ phone: phone, type: "vendor" })
        if (emailExists || phoneExists) return res.status(400).json({ message: "Email or phone already exists" })
        const vendorCategoryExists = await VendorCategory.findById(vendorCategory)
        if (!vendorCategoryExists) return res.status(400).json({ message: "Vendor category not found" })

        let image = req.file ? process.env.BASE_URL + "/uploads/" + req.file.filename : null

        if (!image) return res.status(400).json({ message: "Image is required" })

        const vendor = new Vendor({
            name,
            email,
            password: bycrypt.hashSync(password, 10),
            phone,
            shopUrl,
            type: "vendor",
            vendorCategory,
            image,
            featured,
            shopName,
            shopAddress
        })

        await vendor.save()
        res.status(201).json({ message: "Vendor created successfully" })
    } catch (error) {
        console.log("Error creating vendor: ", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put("/update-vendor/:id", upload.upload.single("image") ,async (req, res) => {
    try {
        let { name, email, phone, password, shopUrl, vendorCategory, featured, shopAddress, shopName } = req.body
        const vendor = await Vendor.findById(req.params.id)
        if (!vendor) return res.status(404).json({ message: "Vendor not found" })
        if (email) {
            email = email.toLowerCase()
            if (!emailValidation(email)) return res.status(400).json({ message: "Invalid email format" })
            const emailExists = await Vendor.findOne({ email: email, type: "vendor" })
            if (emailExists && emailExists._id != req.params.id) return res.status(400).json({ message: "Email already exists" })
        }
        if (phone) {
            const phoneExists = await Vendor.findOne({ phone: phone, type: "vendor" })
            if (phoneExists && phoneExists._id != req.params.id) return res.status(400).json({ message: "Phone already exists" })
        }
        if (vendorCategory) {
            const vendorCategoryExists = await VendorCategory.findById(vendorCategory)
            if (!vendorCategoryExists) return res.status(400).json({ message: "Vendor category not found" })
        }

        vendor.name = name || vendor.name
        vendor.email = email || vendor.email
        vendor.phone = phone || vendor.phone
        vendor.shopUrl = shopUrl || vendor.shopUrl
        vendor.password = password ? bycrypt.hashSync(password, 10) : vendor.password
        vendor.vendorCategory = vendorCategory || vendor.vendorCategory
        vendor.image = req.file ? process.env.BASE_URL + "/uploads/" + req.file.filename : vendor.image
        vendor.featured = featured || vendor.featured
        vendor.shopName = shopName || vendor.shopName
        vendor.shopAddress = shopAddress || vendor.shopAddress
        
        await vendor.save()

        res.status(200).json({ message: "Vendor updated successfully" })
    } catch (error) {
        console.log("Error updating vendor: ", error)
        res.status(500).json({ message: error })
    }
})

// Update user status (toggle between 'active' and 'inactive')
router.put("/update-user-status/:id", async (req, res) => {
    try {
      // Find the user by ID
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Toggle the user status between 'active' and 'inactive'
      user.status = user.status === "active" ? "inactive" : "deleted";
  
      // Save the updated status
      await user.save();
  
      // Send success response
      res.status(200).json({ message: "User status updated successfully", status: user.status });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

router.delete("/delete-vendor/:id", async(req, res)=> {
    try {
        const vendor = await Vendor.findById(req.params.id)
        if(!vendor) return res.status(404).json({message: "Vendor not found"})
        
        const products = await Product.find({vendor: vendor._id})
        products.forEach(async product => {
            await Product.findByIdAndDelete(product._id)
        })

        vendor.name = vendor.name + "_deleted"
        vendor.email = vendor.email + "_deleted"
        vendor.phone = vendor.phone + "_deleted"
        vendor.shopUrl = vendor.shopUrl + "_deleted"
        vendor.status = "deleted"
        vendor.password = bycrypt.hashSync("deleted", 10)

        await vendor.save()
        res.status(200).json({ message: "Vendor deleted successfully" })
    } catch(error){
        console.log("Error deleting vendor: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-vendor-categories", async(req, res)=> {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)
        const total = await VendorCategory.countDocuments()
        const hasNextPage = (skip + parseInt(limit)) < total

        const vendorCategories = await VendorCategory.find().limit(limit).skip(skip)
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({vendorCategories, pagination: paginationObj})
    } catch(error){
        console.log("Error fetching vendor categories: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-vendor-category/:id", async(req, res)=> {
    try {
        const vendorCategory = await VendorCategory.findById(req.params.id)
        if(!vendorCategory) return res.status(404).json({message: "Vendor category not found"})
        res.status(200).json(vendorCategory)
    } catch(error){
        console.log("Error fetching vendor category: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.post("/create-vendor-category", upload.upload.single("image"), async(req, res)=> {
    try {
        const {name, description} = req.body
        if(!name) return res.status(400).json({message: "Name is required"})
        
        const image = req.file ? process.env.BASE_URL + "/uploads/" + req.file.filename : null
        const vendorCategory = new VendorCategory({
            name,
            description,
            image
        })
        await vendorCategory.save()
        res.status(201).json({message: "Vendor category created successfully"})
    } catch(error){
        console.log("Error creating vendor category: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/update-vendor-category/:id", upload.upload.single("image"), async(req, res)=> {
    try {
        const {name, description} = req.body
        const vendorCategory = await VendorCategory.findById(req.params.id)
        if(!vendorCategory) return res.status(404).json({message: "Vendor category not found"})
        
        vendorCategory.name = name || vendorCategory.name
        vendorCategory.description = description || vendorCategory.description
        vendorCategory.image = req.file ? process.env.BASE_URL + "/uploads/" + req.file.filename : vendorCategory.image
        await vendorCategory.save()
        res.status(200).json({message: "Vendor category updated successfully"})
    } catch(error){
        console.log("Error updating vendor category: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.delete("/delete-vendor-category/:id", async(req, res)=> {
    try {
        const vendorCategory = await VendorCategory.findById(req.params.id)
        if(!vendorCategory) return res.status(404).json({message: "Vendor category not found"})
            
        const vendors = await Vendor.find({vendorCategory: vendorCategory._id})
        vendors.forEach(async vendor => {
            vendor.vendorCategory = null
            await vendor.save()
        })

        await VendorCategory.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "Vendor category deleted successfully"})
    } catch(error){
        console.log("Error deleting vendor category: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router