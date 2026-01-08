import 'module-alias/register.js'
import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import catchException from '@/middleware/CatchException'
import { CorsMiddleware } from '@/middleware/CorsMiddleware'

// Load env
dotenv.config({ path: '@/../.env' })

const app = express()

// Middleware
//app.use(CorsMiddleware)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.static('public'))
app.use(catchException)

// Health check
app.get('/health', (req: Request, res: Response) => {
	res.status(200).send('OK')
})

export default app
