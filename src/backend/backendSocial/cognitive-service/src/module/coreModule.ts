import Routes from '@/routes/interface'
import { apiV1 } from '@/server'
import { CoreController } from '@/controllers/coreController'
import multer from 'multer'

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 25 * 1024 * 1024,
	},
	fileFilter: (_req, file, cb) => {
		console.log('File mimetype:', file.mimetype)
		const allowedMimes = [
			'audio/mpeg',
			'audio/mp3',
			'audio/mp4',
			'audio/m4a',
			'audio/wav',
			'audio/wave',
			'audio/x-wav',
			'audio/webm',
			'audio/flac',
			'audio/ogg',
			'audio/opus',
			'audio/x-m4a',
			'video/mp4', // MP4 audio track
			'application/octet-stream', // Fallback for some audio files
		]
		if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
			cb(null, true)
		} else {
			console.error('Rejected file type:', file.mimetype)
			cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`))
		}
	},
})

export class CoreModule extends Routes {
	coreController = new CoreController()

	RegisterRoutes(): void {
		apiV1.get('/models', (req, res) => this.coreController.getModels(req, res))
		apiV1.post('/detect-safety-content', (req, res) =>
			this.coreController.detectSafetyContent(req, res),
		)
		apiV1.post('/speech-to-text', upload.single('audio'), (req, res) =>
			this.coreController.convertSpeechToText(req, res),
		)
	}
}
