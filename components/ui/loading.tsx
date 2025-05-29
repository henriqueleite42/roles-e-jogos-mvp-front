export default function Loading() {
	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
			<header className="p-4 border-b bg-gradient-to-r from-orange-500 to-orange-400 flex items-center">
				<div className="w-6 h-6 bg-white/20 rounded mr-4 animate-pulse" />
				<div className="w-32 h-6 bg-white/20 rounded animate-pulse" />
			</header>
			<main className="flex-1 container mx-auto py-8 px-4">
				<div className="max-w-4xl mx-auto space-y-6">
					<div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />
					<div className="space-y-4">
						<div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse" />
						<div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
						<div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
					</div>
				</div>
			</main>
		</div>
	)
}
