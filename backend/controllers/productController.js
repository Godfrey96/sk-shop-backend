import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import Product from '../models/productModel.js'
import Category from '../models/categoryModel.js'


// @desc    Fetch all products
// @route   Get /api/v1/products
// @desc    Public
const getProducts = asyncHandler(async (req, res) => {
    let filter = {}
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate('category')

    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})

// @desc    Fetch single product
// @route   Get /api/v1/products/:id
// @desc    Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')

    if (!product) {
        res.status(500).json({ success: False })
    }
    res.send(product);

})

// @desc    Create a product
// @route   POST /api/v1/products
// @desc    Private/Admin  
const createProduct = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    product = await product.save();

    if (!product) {
        return res.status(400).send('the product cannot be created!')
    }
    res.send(product)
})

// @desc    Update a product
// @route   POST /api/v1/products/:id
// @desc    Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')

    const product = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    },
        { new: true }
    )
    if (!product) {
        return res.status(404).send('the product cannot be updated!');
    }
    res.send(product)
})

// @desc    Delete a product
// @route   POST /api/v1/products/:id
// @desc    Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'the product is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'product not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

// @desc    GET product count
// @route   POST /api/v1/products/get/count
// @desc    Private/Admin
const GetProductCount = asyncHandler(async (req, res) => {
    const productCount = await Product.countDocuments({})

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount
    });
})

// @desc    GET featured product count
// @route   POST /api/v1/products/get/featured/:count
// @desc    Private/Admin
const getFeaturedProduct = asyncHandler(async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count)

    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products);
})

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    GetProductCount,
    getFeaturedProduct
}