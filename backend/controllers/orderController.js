import asyncHandler from 'express-async-handler'
import OrderItem from '../models/order-itemModel.js'
import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import Stripe from 'stripe'

const stripe = new Stripe('sk_test_51JjjPCF3RlIhoq4AkOwHSs7EN8fr0t4lBuf3AvPCdgI3zGEgtf4k6rCTYcyOtyoDvX27ibOBQXeSbiNE5SzygoCl00a2iE3MGU');
// const stripe = require(stripe)('sk_test_51JjjPCF3RlIhoq4AkOwHSs7EN8fr0t4lBuf3AvPCdgI3zGEgtf4k6rCTYcyOtyoDvX27ibOBQXeSbiNE5SzygoCl00a2iE3MGU')

// @desc    Fetch all orders
// @route   Get /api/v1/orders
// @desc    Public/Private-Admin
const getOrders = asyncHandler(async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 })

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList)
})

// @desc    Fetch single order
// @route   Get /api/v1/orders/:id
// @desc    Public
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        })

    if (!order) {
        res.status(500).json({ message: 'The order with the given ID was not found' })
    }
    res.status(200).send(order)
})

// @desc    Create a new order
// @route   POST /api/v1/orders
// @desc    Public
const createOrder = asyncHandler(async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if (!order) {
        return res.status(400).send('the order cannot be created!')
    }
    res.send(order)
})

// @desc    Create a checkout session
// @route   POST /api/v1/create-checkout-session
// @desc    Public
const createCheckoutSession = asyncHandler(async (req, res) => {
    const orderItems = req.body;

    if (!orderItems) {
        return res.status(400).send('checkout session cannot be created - check the order items')
    }

    const lineItems = await Promise.all(
        orderItems.map(async (orderItem) => {
            const product = await Product.findById(orderItem.product);
            return {
                price_data: {
                    currency: 'zar',
                    product_data: {
                        name: product.name
                    },
                    unit_amount: product.price * 100
                },
                quantity: orderItem.quantity
            };
        })
    );

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: 'http://localhost:4200/success',
        cancel_url: 'http://localhost:4200/error'
    })

    res.json({ id: session.id });
})

// @desc    Update a order
// @route   POST /api/v1/orders/:id
// @desc    Private/Admin
const updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    },
        { new: true }
    )
    if (!order) {
        return res.status(404).send('the order cannot be updated!');
    }
    res.send(order)
})

// @desc    Delete a order
// @route   POST /api/v1/order/:id
// @desc    Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'order not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

// @desc    GET a total sales
// @route   POST /api/v1/order/:id
// @desc    Private/Admin
const getTotalSales = asyncHandler(async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({ totalsales: totalSales.pop().totalsales })
})

// @desc    GET order count
// @route   POST /api/v1/orders/get/count
// @desc    Private/Admin
const GetOrderCount = asyncHandler(async (req, res) => {
    const orderCount = await Order.countDocuments({})

    if (!orderCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        orderCount: orderCount
    })
})

// @desc    Fetch all orders
// @route   Get /api/v1/orders
// @desc    Public/Private-Admin
const getUserOrders = asyncHandler(async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid })
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        })
        .sort({ 'dateOrdered': -1 })

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList)
})

export {
    getOrders,
    createOrder,
    createCheckoutSession,
    getOrderById,
    updateOrder,
    deleteOrder,
    getTotalSales,
    GetOrderCount,
    getUserOrders
}