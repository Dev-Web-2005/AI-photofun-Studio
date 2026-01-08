import ApiResponse from '@/dtos/ApiResponse'
import { CoreService } from '@/services/coreService'
import AppException from '@/exception/AppException'
import ErrorCode from '@/exception/ErrorCode'

export class CoreController {
	// external
	coreService = new CoreService()
	expectXApiKey = process.env.X_API_KEY || 'lethanhcong'

	async getModels(req: any, res: any) {
		const xApiKey = req.headers['x-api-key']
		if (xApiKey !== this.expectXApiKey) {
			throw new AppException(ErrorCode.API_KEY_INVALID)
		}
		const apiKey = req.headers.authorization?.split(' ')[1]
		const data = await this.coreService.getModels(apiKey)
		return res.status(200).json(
			new ApiResponse({
				code: 1000,
				message: 'Success',
				data: data,
			}),
		)
	}

	async detectSafetyContent(req: any, res: any) {
		const xApiKey = req.headers['x-api-key']
		if (xApiKey !== this.expectXApiKey) {
			throw new AppException(ErrorCode.API_KEY_INVALID)
		}
		const apiKey = req.headers.authorization?.split(' ')[1]
		const isSafe = await this.coreService.detectSafetyContent(apiKey, req.body.message)
		return res.status(200).json(
			new ApiResponse({
				code: 1000,
				message: 'Success',
				data: {
					isSafe: isSafe,
				},
			}),
		)
	}

	async convertSpeechToText(req: any, res: any) {
		const xApiKey = req.headers['x-api-key']
		if (xApiKey !== this.expectXApiKey) {
			throw new AppException(ErrorCode.API_KEY_INVALID)
		}

		if (!req.file) {
			throw new AppException(ErrorCode.INVALID_PARAM)
		}

		const apiKey = req.headers.authorization?.split(' ')[1]
		const audioBase64 = req.file.buffer.toString('base64')
		const result = await this.coreService.convertSpeechToText(apiKey, audioBase64)

		return res.status(200).json(
			new ApiResponse({
				code: 1000,
				message: 'Success',
				data: result,
			}),
		)
	}
}
