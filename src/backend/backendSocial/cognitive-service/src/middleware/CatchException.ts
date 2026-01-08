import AppException from '../exception/AppException'
import ErrorCode from '../exception/ErrorCode'
import { HttpStatus } from '../exception/HttpStatus'

export default function catchException(err: any, req: any, res: any, next: any) {
	try {
		if (err instanceof AppException) {
			const errorCode = err.errorCode
			return res.status(errorCode.status).json(errorCode.toObject())
		}
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(ErrorCode.UNKNOWN_ERROR.toObject())
	} catch (err) {
		console.error('Unhandled exception:', err)
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(ErrorCode.UNKNOWN_ERROR.toObject())
	}
}
