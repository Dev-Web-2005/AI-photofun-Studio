import axios from 'axios'
import { decodeBase64 } from '../../utils'
import fs from 'fs'
import AppException from '@/exception/AppException'
import ErrorCode from '@/exception/ErrorCode'

const PROMPT_SYSTEM = fs.readFileSync('src/config/prompt/prompt-system.txt', 'utf-8')
const PROMPT_SYSTEM_SAFETY_CONTENT = fs.readFileSync(
	'src/config/prompt/safety_content/prompt-system.txt',
	'utf-8',
)
const PROMPT_USER_SAFETY_CONTENT = fs.readFileSync(
	'src/config/prompt/safety_content/prompt-user.txt',
	'utf-8',
)

const groqClient = axios.create({
	baseURL: decodeBase64(process.env.BASE_URL || 'aHR0cHM6Ly9hcGkuZ3JvcS5jb20='),
	headers: {
		'Content-Type': 'application/json',
	},
})

export function getModels(apiKey: string | undefined) {
	return groqClient
		.get('/openai/v1/models', {
			headers: { Authorization: `Bearer ${apiKey}` },
		})
		.then((response) => response)
		.catch((error) => {
			console.log('Error fetching models:', error)
			return null
		})
}

export function chatCompletion_safetyContent(
	apiKey: string | undefined,
	model: string,
	message: string,
) {
	const content = PROMPT_USER_SAFETY_CONTENT.replace('<CONTENT>', message)
	return groqClient
		.post(
			'/openai/v1/chat/completions',
			{
				model: model,
				messages: [
					{ role: 'system', content: PROMPT_SYSTEM },
					{ role: 'system', content: PROMPT_SYSTEM_SAFETY_CONTENT },
					{ role: 'user', content: content },
				],
			},
			{
				headers: { Authorization: `Bearer ${apiKey}` },
			},
		)
		.then((response) => response)
		.catch((error) => {
			console.error('Error during chat completion:', error)
			return null
		})
}

export function speechToText(
	apiKey: string | undefined,
	model: string,
	audioBase64: string,
) {
	const audioBuffer = Buffer.from(audioBase64, 'base64')
	const formData = new FormData()
	formData.append('model', model)
	formData.append('file', new Blob([audioBuffer]), 'audio.wav')
	return groqClient
		.post('/openai/v1/audio/transcriptions', formData, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'multipart/form-data',
			},
		})
		.then((response) => response)
		.catch((error) => {
			// Don't throw, return null to allow fallback to system API keys
			console.log('Speech-to-text failed with key:', apiKey?.substring(0, 10) + '...')
			return null
		})
}

export default groqClient
