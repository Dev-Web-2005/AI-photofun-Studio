import ErrorCode from '@/exception/ErrorCode'

export default class AppException extends Error {
	errorCode: ErrorCode
	constructor(errorCode: ErrorCode) {
		super(errorCode.message)
		this.errorCode = errorCode
	}
}
