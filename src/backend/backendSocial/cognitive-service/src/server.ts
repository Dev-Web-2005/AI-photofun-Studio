import { Router } from 'express'
import app from './app.js'
import Routes from '@/routes/interface.js'
import { CoreModule } from '@/module/coreModule.js'
import PublishApi from '@/routes/PublishApi.js'
import logger from '@/logs/Logger.js'

logger.info('Logger initialized')
// Debug mode
const DEBUG = process.env.DEBUG === 'true'
if (DEBUG) console.log('Debug mode enabled')
const PORT = process.env.PORT || 3000

// Register API version routers
export const apiV1 = Router()

// Push version routers to app
app.use('/cognitive', apiV1)

// Publish Api
const routes: Routes[] = [new CoreModule()] // Add new modules here
PublishApi(routes)

// Start server
const server = app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

// Safe shutdown
let isShuttingDown = false

function gracefulShutdown(signal: string) {
	if (isShuttingDown) return
	isShuttingDown = true
	console.log(`\nReceived ${signal}. Closing server gracefully...`)

	server.close((err: Error | undefined) => {
		if (err) {
			console.error('Error during shutdown:', err)
			process.exit(1)
		}
		console.log('Server closed successfully.')
		process.exit(0)
	})

	setTimeout(() => {
		console.error('Force shutdown - timeout exceeded.')
		process.exit(1)
	}, 5000)
}

// Signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'))

export default server
