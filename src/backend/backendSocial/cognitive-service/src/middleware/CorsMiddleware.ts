import { NextFunction, Request, Response } from 'express'

export function CorsMiddleware(_req: Request, res: Response, next: NextFunction) {
	res.setHeader('Access-Control-Allow-Origin', process.env.ORIGIN || '*')
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
	)
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
	next()
}
