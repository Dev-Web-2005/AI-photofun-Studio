import { HttpStatus } from './HttpStatus'
export default class ErrorCode {
	static readonly UNKNOWN_ERROR: ErrorCode = new ErrorCode(
		1000,
		'Unknown error',
		HttpStatus.INTERNAL_SERVER_ERROR,
	)
	static readonly INVALID_REQUEST: ErrorCode = new ErrorCode(
		1001,
		'Invalid request',
		HttpStatus.BAD_REQUEST,
	)
	static readonly API_KEY_INVALID: ErrorCode = new ErrorCode(
		1002,
		'API key is invalid',
		HttpStatus.UNAUTHORIZED,
	)
	static readonly DONT_HAVE_ENOUGH_API_KEY: ErrorCode = new ErrorCode(
		1003,
		"Don't have enough valid API key to process the request",
		HttpStatus.FORBIDDEN,
	)
	static readonly INVALID_PARAM: ErrorCode = new ErrorCode(
		1004,
		'Invalid parameters',
		HttpStatus.BAD_REQUEST,
	)

	code: number
	message: string
	status: number

	constructor(code: number, message: string, status: number) {
		this.code = code
		this.message = message
		this.status = status
	}

	toObject() {
		return {
			code: this.code,
			message: this.message,
			status: this.status,
		}
	}
}
