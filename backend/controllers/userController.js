import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

// @desc    Fetch all users
// @route   Get /api/v1/users
// @desc    Public
const getUsers = asyncHandler(async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(userList)
})

// @desc    Fetch single user
// @route   Get /api/v1/users/:id
// @desc    Public
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({ message: 'The user with the given ID was not found.' });
    }
    res.status(200).send(user);
})

// @desc    Create a user
// @route   POST /api/v1/users
// @desc    Private/Admin
const registerUser = asyncHandler(async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAmin: req.body.isAmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if (!user) {
        return res.status(400).send('the user cannot be created!');
    }
    res.send(user);
})

// @desc    Update a user
// @route   POST /api/v1/users/:id
// @desc    Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAmin: req.body.isAmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true }
    )
    if (!user) {
        return res.status(404).send('the user cannot be updated!');
    }
    res.send(user);
})

// @desc    AUTH user & get token
// @route   POST /api/v1/users/login
// @desc    Private/Admin
const loginUser = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.JWT_SECRET;

    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {

        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )

        // res.status(200).send({ user: user.email, token: generateToken(user._id) })
        res.status(200).send({ user: user.email, token: token })
    } else {
        return res.status(200).send('passowrd is wrong!');
    }
})

// @desc    Delete a user
// @route   POST /api/v1/users/:id
// @desc    Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'the user is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'user not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

// @desc    GET user count
// @route   POST /api/v1/users/get/count
// @desc    Private/Admin
const GetUserCount = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments({})

    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount
    });
})

export {
    getUsers,
    getUserById,
    registerUser,
    updateUser,
    loginUser,
    deleteUser,
    GetUserCount
}