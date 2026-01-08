import AppException from '@/exception/AppException'
import * as client from '@/repositories/http/gropqClient'
import fs from 'fs'
import ErrorCode from '@/exception/ErrorCode'

export class CoreService {
	MODELS_CHAT = fs.readFileSync('src/config/models-chat.txt', 'utf-8').split('\n')
	MODELS_MODERATION = fs
		.readFileSync('src/config/models-moderation.txt', 'utf-8')
		.split('\n')
	MODELS_STT = ['whisper-large-v3-turbo']

	SYSTEM_API_KEY = process.env.API_KEYs?.split(',') || []
	LIST_KEY_WORD_DENIED = fs
		.readFileSync('src/config/prompt/list-keyword-denied.txt', 'utf-8')
		.split('\n')

	async getModels(apiKeyUser: string | undefined) {
		const response = await client.getModels(apiKeyUser)
		if (response && response.status === 200) {
			return response.data
		}

		for (const apiKey of this.SYSTEM_API_KEY) {
			const resp = await client.getModels(apiKey)
			if (resp && resp.status === 200) {
				return resp.data
			}
		}

		throw new AppException(ErrorCode.DONT_HAVE_ENOUGH_API_KEY)
	}

	async detectSafetyContent(apiKey: string | undefined, message: string) {
		// Skip keyword check - rely on AI model for better accuracy
		const newListApiKey = [apiKey, ...this.SYSTEM_API_KEY]
		for (const key of newListApiKey) {
			try {
				for (const model of this.MODELS_MODERATION) {
					try {
						const response = await client.chatCompletion_safetyContent(
							key,
							model,
							message,
						)
						if (response && response.status === 200) {
							const content = response.data.choices[0].message.content.toLowerCase()
							// Check "unsafe" first to avoid matching "safe" in "unsafe"
							if (content.includes('unsafe')) {
								return false
							}
							if (content.includes('safe')) {
								return true
							}
						}
					} catch (err) {
						continue
					}
				}
			} catch (err) {
				continue
			}
		}
		throw new AppException(ErrorCode.DONT_HAVE_ENOUGH_API_KEY)
	}

	async convertSpeechToText(apiKey: string | undefined, audioBase64: string) {
		const newListApiKey = [apiKey, ...this.SYSTEM_API_KEY]
		for (const key of newListApiKey) {
			for (const model of this.MODELS_STT) {
				try {
					const response = await client.speechToText(key, model, audioBase64)
					if (response && response.status === 200) {
						return response.data
					}
				} catch (err) {
					continue
				}
			}
		}

		throw new AppException(ErrorCode.DONT_HAVE_ENOUGH_API_KEY)
	}
}
