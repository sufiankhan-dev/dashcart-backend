const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Config = require("../../models/Config");
const Discount = require("../../models/Discount");

router.get("/get-orders", async (req, res) => {
    try {
        const userId = req.user._id
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)

        const total = await Order.countDocuments({user: userId})
        const hasNextPage = (skip + parseInt(limit)) < total
        const orders = await Order.find({user: userId}).limit(limit).skip(skip).populate("products.product")
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({orders, pagination: paginationObj})
    } catch (error){ 
        console.log("Error fetching orders", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-orders/:id", async (req, res) => {
    try {
        const userId = req.user._id
        const order = await Order.find({_id:req.params.id, user: userId}).populate({
            path: "products.product",
            populate: {
            path: "category vendor"
            }
        })
        if(!order) return res.status(404).json({message: "Order not found"})
        res.status(200).json(order)
    } catch(error) {
        console.log("Error fetching order", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.post("/create-order", async (req, res) => {
    try {
        const userId = req.user._id
        const { products, address, discount } = req.body;
        const productIds = products.map(product => product.product);
        const productsExist = await Product.find({ _id: { $in: productIds } });
        
        if (productsExist.length !== products.length) 
            return res.status(400).json({ message: "Product not found" });

        const notEnoughStock = productsExist.find(product => {
            const productOrder = products.find(p => p.product == product._id);
            return product.stock < productOrder.quantity;
        });
        
        if (products.length === 0) {
            return res.status(400).json({ message: "Products are required" });
        }

        if (notEnoughStock) 
            return res.status(400).json({ message: "Not enough stock for product" });

        const discountCode = await Discount.findOne({code: discount});
        if (discount) {
            const discountExist = await Discount.findOne({ code: discount });
            if (!discountExist) 
                return res.status(400).json({ message: "Discount code not found" });
            if (discountExist.status !== "active") 
                return res.status(400).json({ message: "Discount code is inactive" });
        }

        if (!address.address) return res.status(400).json({ message: "Address is required" });

        let total = productsExist.reduce((acc, product) => {
            const productOrder = products.find(p => p.product == product._id);
            return acc + product.price * productOrder.quantity;
        }, 0);

        if (discountCode?.type === "percentage") {
            total = total - (total * (discountCode.discount / 100));
        } else if (discountCode?.type === "fixed") {
            total = total - discountCode.discount;
        }

        const config = await Config.findOne();
        const vendorIds = productsExist.map(product => product.vendor.toString());
        const uniqueVendors = [...new Set(vendorIds)];
        // console.log(uniqueVendors.length);

        let deliveryFee = config.deliveryFeeV1;
        if (uniqueVendors.length > 1) {
            deliveryFee = config.deliveryFeeV2;
            if (uniqueVendors.length > 2) {
                deliveryFee = (config.deliveryFeeV2 + ((uniqueVendors.length - 2)*config.deliveryFeeVI));
                // console.log((uniqueVendors.length - 2)*config.deliveryFeeVI)
            }
        }

        const tax = total * (config.tax / 100);
        const platformFee = config.platformFee;
        const grandTotal = total + deliveryFee + tax + platformFee;

        const product = products.map(product => {
            const productInfo = productsExist.find(p => p._id == product.product);
            productInfo.stock -= product.quantity;
            productInfo.save();
            return {
                vendor: productInfo.vendor,
                product: productInfo._id,
                quantity: product.quantity,
                price: productInfo.price,
            }
        })

        const orderNumber = `SSQ-${Math.floor(1000 + Math.random() * 9000)}`;

        const order = new Order({
            user: userId,
            orderNumber,
            products: product,
            deliveryFee,
            tax,
            platformFee,
            total,
            grandTotal,
            status: "pending",
            address
        });

        await order.save();

        res.status(200).json({ order: {orderNumber, total, deliveryFee, tax, platformFee, grandTotal, status: "pending", address} });
    } catch (error) {
        console.log("Error Creating Order", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete("/delete-order/:id", async (req, res) => {
    try {
        const userId = req.user._id
        const orderId = req.params.id
        const order = await Order.findOne({user: userId, _id: req.params.id})
        if(!order) return res.status(404).json({message: "Order not found"})

        if(order.status !== "pending") return res.status(400).json({message: "Order can not be cancelled"})

        for (const productInfo of order.products) {
            const productId = productInfo.product;
            const quantity = productInfo.quantity;
            const product = await Product.findById(productId);
            product.stock += quantity;
            await product.save();
        }

        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ message: "Order deleted successfully" });
    } catch(error) {
        console.log("Error deleting order", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.post("/get-checkout", async (req, res) => {
    try {
        const { products, discount } = req.body;
        const productIds = products.map(product => product.product);
        const productsExist = await Product.find({ _id: { $in: productIds } });
        
        if (productsExist.length !== products.length) 
            return res.status(400).json({ message: "Product not found" });

        const notEnoughStock = productsExist.find(product => {
            const productOrder = products.find(p => p.product == product._id);
            return product.stock < productOrder.quantity;
        });
        
        if (notEnoughStock) 
            return res.status(400).json({ message: "Not enough stock for product" });

        const discountCode = await Discount.findOne({code: discount});
        if (discount) {
            const discountExist = await Discount.findOne({ code: discount });
            if (!discountExist) 
                return res.status(400).json({ message: "Discount code not found" });
            if (discountExist.status !== "active") 
                return res.status(400).json({ message: "Discount code is inactive" });
        }

        let total = productsExist.reduce((acc, product) => {
            const productOrder = products.find(p => p.product == product._id);
            return acc + product.price * productOrder.quantity;
        }, 0);

        if (discountCode?.type === "percentage") {
            total = total - (total * (discountCode.discount / 100));
        } else if (discountCode?.type === "fixed") {
            total = total - discountCode.discount;
        }

        const config = await Config.findOne();
        const vendorIds = productsExist.map(product => product.vendor.toString());
        const uniqueVendors = [...new Set(vendorIds)];
        // console.log(uniqueVendors.length);

        let deliveryFee = config.deliveryFeeV1;
        if (uniqueVendors.length > 1) {
            deliveryFee = config.deliveryFeeV2;
            if (uniqueVendors.length > 2) {
                deliveryFee = (config.deliveryFeeV2 + ((uniqueVendors.length - 2)*config.deliveryFeeVI));
                // console.log((uniqueVendors.length - 2)*config.deliveryFeeVI)
            }
        }

        const tax = total * (config.tax / 100);
        const platformFee = config.platformFee;
        const grandTotal = total + deliveryFee + tax + platformFee;

        res.status(200).json({ total, deliveryFee, tax, platformFee, grandTotal });
    } catch (error) {
        console.log("Error getting checkout", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;