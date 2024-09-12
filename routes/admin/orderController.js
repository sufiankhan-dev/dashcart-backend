const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const User = require("../../models/User");
const Discount = require("../../models/Discount");
const Config = require("../../models/Config");
const Rider = require("../../models/Rider");


router.get("/get-orders", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)
        const total = await Order.countDocuments()
        const hasNextPage = (skip + parseInt(limit)) < total
        const orders = await Order.find().limit(limit).sort({date: -1}).skip(skip).populate("user","-address -password").populate("products.product rider","-password")
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({orders, pagination: paginationObj})
    } catch(error) {
        console.log("Error fetching orders", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "-address -password").populate({
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

router.get("/get-orders/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: "User not found"})

        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)
        const total = await Order.countDocuments({user: req.params.id})
        const hasNextPage = (skip + parseInt(limit)) < total
        const orders = await Order.find({user: req.params.id}).limit(limit).skip(skip).populate("user","-address -password").populate("products.product")
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({orders, pagination: paginationObj})
    } catch(error) {
        console.log("Error fetching orders", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.post("/create-order", async (req, res) => {
    try {
        const { userId, products, discount, address } = req.body;
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

        const UserExists = await User.findById(userId);
        if (!UserExists) return res.status(400).json({ message: "User not found" });

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
            products : product,
            deliveryFee,
            tax,
            platformFee,
            total,
            grandTotal,
            address,
            status: "pending",
        });

        await order.save();

        res.status(200).json({ order: {orderNumber, total, deliveryFee, tax, platformFee, grandTotal, status: "pending", address} });
    } catch (error) {
        console.log("Error Creating Order", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.put("/update-order/:id", async (req, res) => {
    try {
        const {user, products} = req.body
        if (!user || !products) return res.status(400).json({message: "All fields are required"})
        const userExists = await User.findById(user)
        if(!userExists) return res.status(400).json({message: "User not found"})
        const productIds = products.map(product => product.product)
        const productsExist = await Product.find({_id: {$in: productIds}})
        if(productsExist.length !== products.length) return res.status(400).json({message: "Product not found"})

        const notEnoughStock = productsExist.find(product => {
            const productOrder = products.find(p => p.product == product._id)
            return product.stock < productOrder.quantity
        })
        if(notEnoughStock) return res.status(400).json({message: "Not enough stock for product"})

        const order = await Order.findById(req.params.id)
        if(!order) return res.status(404).json({message: "Order not found"})

        order.user = user || order.user
        order.products = products || order.products

        await order.save()

        const updatedProducts = productsExist.map(product => {
            const productOrder = products.find(p => p.product == product._id)
            product.stock = product.stock - productOrder.quantity
            return product.save()
        })

        await Promise.all(updatedProducts)

        res.status(200).json({message: "Order updated successfully"})
    } catch (error) {
        console.log("Error updating order", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.delete("/delete-order/:id", async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        for (const productInfo of order.products) {
            const productId = productInfo.product;
            const quantity = productInfo.quantity;
            const product = await Product.findById(productId);
            product.stock += quantity;
            await product.save();
        }

        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.log("Error deleting order", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/update-order-status/:id", async (req, res) => {
    try {
        const {status} = req.body
        if (!status) return res.status(400).json({message: "All fields are required"})
        const order = await Order.findById(req.params.id)
        if(!order) return res.status(404).json({message: "Order not found"})
        if(!["pending", "completed", "assigned"].includes(status)) return res.status(400).json({message: "Invalid status"})

        order.status = status

        if(status === "completed") {
            order.date_of_delivery = new Date()
        }

        await order.save()

        res.status(200).json({message: "Order status updated successfully"})
    } catch (error) {
        console.log("Error updating order status", error)
        res.status(500).json({message: "Internal server error"})
    }
})
router.put("/assign-order/:orderId/rider/:riderId", async (req, res) => {
    try {
        const { orderId, riderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const rider = await Rider.findById(riderId);
        if (!rider) return res.status(404).json({ message: "Rider not found" });

        order.rider = rider._id;
        await order.save();

        rider.orders.push(order._id);
        order.status = "assigned"

        await rider.save();
        await order.save();

        res.status(200).json({ message: "Order assigned to rider successfully" });
    } catch (error) {
        console.log("Error assigning order to rider", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;