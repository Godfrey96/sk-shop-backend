import express from 'express';
import { config } from 'dotenv';
import colors from 'colors';
import path from 'path'
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/db.js';
import { authJwt } from './middleware/jwt.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import multer from 'multer';
import uploadRoutes from './routes/uploadRoutes.js'

import productOfRoutes from './routes/product.js';

config()

const app = express()

app.use(cors())


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json())
app.use(authJwt());

connectDB()

app.get('/', (req, res) => {
    res.send('API is running')
})


// product routes
// app.use('/api/v1/products', productRoutes)
app.use('/api/v1/products', productOfRoutes)
// categories routes
app.use('/api/v1/categories', categoryRoutes)
// users routes
app.use('/api/v1/users', userRoutes)
// orders routes
app.use('/api/v1/orders', orderRoutes)
// product image routes
app.use('/api/v1/uploads', uploadRoutes)

const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))


// const __dirname = path.resolve()
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

app.use(notFound)
app.use(errorHandler)
// app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))