import express from 'express'
import {
    getOrders,
    createOrder,
    createCheckoutSession,
    getOrderById,
    updateOrder,
    deleteOrder,
    getTotalSales,
    GetOrderCount,
    getUserOrders
} from '../controllers/orderController.js'

const router = express.Router()

router
    .route('/')
    .get(getOrders)
    .post(createOrder)

router.route('/create-checkout-session').post(createCheckoutSession)

router
    .route('/get/totalsales')
    .get(getTotalSales)

router
    .route('/get/count')
    .get(GetOrderCount)

router
    .route('/:id')
    .get(getOrderById)
    .put(updateOrder)
    .delete(deleteOrder)

router
    .route('/get/userorders/:userid')
    .get(getUserOrders)

export default router