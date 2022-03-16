import asyncHandler from 'express-async-handler'
import Category from '../models/categoryModel.js'

// @desc    Fetch all categories
// @route   Get /api/v1/categories
// @desc    Public
const getCategories = asyncHandler(async (req, res) => {
    const categoryList = await Category.find()

    if (!categoryList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(categoryList)
})

// @desc    Fetch single category
// @route   Get /api/v1/categories/:id
// @desc    Public
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(500).json({ message: 'The category with the given ID was not found' })
    }
    res.status(200).send(category)
})

// @desc    Create a category
// @route   POST /api/v1/categories
// @desc    Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();

    if (!category) {
        return res.status(400).send('the category cannot be created!')
    }
    res.send(category)
})

// @desc    Update a category
// @route   POST /api/v1/categories/:id
// @desc    Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    },
        { new: true }
    )
    if (!category) {
        return res.status(404).send('the category cannot be updated!');
    }
    res.send(category)
})

// @desc    Delete a category
// @route   POST /api/v1/categories/:id
// @desc    Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'the category is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'category not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: Err })
    })
})

export {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
}