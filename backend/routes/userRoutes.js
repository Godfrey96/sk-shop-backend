import express from 'express'
import {
    getUsers,
    getUserById,
    registerUser,
    updateUser,
    loginUser,
    deleteUser,
    GetUserCount
} from '../controllers/userController.js'

const router = express.Router()

router
    .route('/')
    .get(getUsers)
router
    .route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser)
router
    .route('/login')
    .post(loginUser)
router
    .route('/')
    .post(registerUser)
router.route('/get/count').get(GetUserCount)

export default router