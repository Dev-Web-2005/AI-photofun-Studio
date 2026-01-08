export default class ApiResponse<T = any> {
	code: number
	message: string
	data: T | null
	constructor(params: { code?: number; message?: string; data?: T }) {
		this.code = params.code || 1000
		this.message = params.message || 'Success'
		this.data = params.data || null
	}
}
