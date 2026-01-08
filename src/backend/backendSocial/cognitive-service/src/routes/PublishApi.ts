import Routes from '@/routes/interface'

export default function PublishApi(routes: Routes[]) {
	for (const route of routes) {
		route.RegisterRoutes()
	}
}
