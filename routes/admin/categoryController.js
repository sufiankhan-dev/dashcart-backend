const express = require("express")
const router = express.Router()
const Category = require("../../models/Category")
const Product = require("../../models/Product")
const upload = require("../../helper/multerUpload")

router.get("/get-categories", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)
        const total = await Category.countDocuments()
        const hasNextPage = (skip + parseInt(limit)) < total
        const categories = await Category.find().limit(limit).skip(skip)
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({categories, pagination: paginationObj})
    } catch(error) {
        console.log("Error fetching categories", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-categories/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category) return res.status(404).json({ message: "Category not found" })
        res.status(200).json(category)
    } catch (error) {
        console.log("error fetching category", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post("/create-category", upload.upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "Category name is required" });
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) return res.status(400).json({ message: "Category already exists" });

        console.log(req.file)
        
        const imageUrl = process.env.BASE_URL + "/uploads/" + req.file.filename;

        const category = new Category({
            name,
            description,
            image: imageUrl
        });

        await category.save();
        res.status(201).json({ message: "Category created successfully" });
    } catch (error) {
        console.log("error creating category", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/update-category/:id", upload.upload.single('image'), async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category) return res.status(404).json({ message: "Category not found" })
        const { name, description } = req.body
        const categoryExists = await Category.findOne({ name })
        if (categoryExists && categoryExists._id != req.params.id) return res.status(400).json({ message: "Category already exists" })

        console.log(req.file)

        category.name = name || category.name
        category.description = description || category.description
        category.image = req.file ? process.env.BASE_URL + "/uploads/" + req.file.filename : category.image

        await category.save()
        res.status(200).json({ message: "Category updated successfully" })
    } catch (error) {
        console.log("error updating category", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put("/update-category-status/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category) return res.status(404).json({ message: "Category not found" })

        if (category.status === "active") {
            category.status = "inactive"
        } else {
            category.status = "active"
        }

        await category.save()
        res.status(200).json({ message: "Category status updated successfully" })
    } catch (error) {

    }
})

router.delete("/delete-category/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category) return res.status(404).json({ message: "Category not found" })
        const products = await Product.find({ category: req.params.id })
        if (products.length > 0) {
            await Product.deleteMany({ category: req.params.id })
        }
        const categoryDelete = await Category.findByIdAndDelete(req.params.id)
        if (!categoryDelete) return res.status(404).json({ message: "Category not found" })
        res.status(200).json({ message: "Category deleted successfully" })
    } catch (error) {
        console.log("error deleting category", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router