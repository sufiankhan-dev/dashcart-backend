const express = require("express");
const router = express.Router()
const Order = require("../../models/Order")

router.get("/get-orders", async (req, res)=> {
    try{
        const vendorId = req.user.id
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit
        const hasNextPage = await Order.find().limit(limit).skip(skip + limit)
        let orders = await Order.find(
        ).populate("products.product").populate({
            path: "user",
            select: "-password -role -type -createdAt -date -status -address"
        })

        orders = orders.filter(order => {
            return order.products.some(product => product.product.vendor.toString() === vendorId)
        })

        const filteredOrders = orders.map(order => {
            const product = order.products.find(product => product.product.vendor.toString() == vendorId)
            order.products = [product]
            return order
        })

        const paginationObj = {
            page,
            limit,
            total: orders.length,
            hasNextPage: hasNextPage.length > 0
        }

        res.status(200).json({orders: filteredOrders, pagination: paginationObj})
    } catch(error) {
        console.log("Error fetching orders", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-orders/:id", async (req, res)=> {
    try{
        const vendorId = req.user.id
        const order = await Order.findById(req.params.id).populate("products.product").populate({
            path: "user",
            select: "-password -role -type -createdAt -date -status -address"
        })
        if(!order) return res.status(404).json({message: "Order not found"})
        if(!order.products.some(product => product.product.vendor == vendorId)) return res.status(404).json({message: "Order not found"})
        
        if(!order) return res.status(404).json({message: "Order not found"})
        res.status(200).json(order)
    } catch(error) {
        console.log("Error fetching orders", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/update-order-status/:id", async (req, res)=> {
    try{
        const vendorId = req.user.id
        console.log(vendorId)
        const order = await Order.findById(req.params.id)
        if(!order) return res.status(404).json({message: "Order not found"})
        if(!order.products.some(product => product.vendor.toString() == vendorId)) return res.status(404).json({message: "Order not found"})
        
        order.products.map(async (product) => {
            if(product.vendor.toString() == vendorId) {
                product.status = "shipped out"

                await product.save()
            }
        })

        await order.save()

        res.status(200).json({message: "Order status updated!", order})
    } catch(error) {
        console.log("Error fetching orders", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router