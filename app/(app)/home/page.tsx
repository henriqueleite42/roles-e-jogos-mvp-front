import Link from "next/link"
import { Dice6, Calendar, MapPin, Camera, MessageCircle, Video } from "lucide-react"

export default function HomePage() {
	return (
		<main className="flex-1 p-4">
			<div className="grid grid-cols-2 gap-6 max-w-md mx-auto pt-4">
				{/* Jogos Card */}
				<Link
					href="/jogos"
					className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-sky-600/20 opacity-50"></div>
					<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-500/10"></div>
					<div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-sky-500/20"></div>

					<div className="relative flex aspect-square flex-col items-center justify-center p-4">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
							<Dice6 className="h-8 w-8 text-white" />
						</div>
						<div className="text-xl font-bold text-sky-600">Jogos</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>

				{/* Eventos Card */}
				<Link
					href="/eventos"
					className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 opacity-50"></div>
					<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10"></div>
					<div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-purple-500/20"></div>

					<div className="relative flex aspect-square flex-col items-center justify-center p-4">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
							<Calendar className="h-8 w-8 text-white" />
						</div>
						<div className="text-xl font-bold text-purple-600">Eventos</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>

				{/* Mapa Card */}
				<Link
					href="/mapa"
					className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20 opacity-50"></div>
					<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/10"></div>
					<div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-amber-500/20"></div>

					<div className="relative flex aspect-square flex-col items-center justify-center p-4">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
							<MapPin className="h-8 w-8 text-white" />
						</div>
						<div className="text-xl font-bold text-amber-600">Mapa</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>

				{/* Comunidade Card */}
				<Link
					href="/whatsapp"
					className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20 opacity-50"></div>
					<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-500/10"></div>
					<div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-green-500/20"></div>

					<div className="relative flex aspect-square flex-col items-center justify-center p-4">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
							<MessageCircle className="h-8 w-8 text-white" />
						</div>
						<div className="text-xl font-bold text-green-600">Comunidade</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>


				{/* Instagram Card */}
				<Link
					href="/instagram"
					className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-pink-600/20 opacity-50"></div>
					<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-pink-500/10"></div>
					<div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-pink-500/20"></div>

					<div className="relative flex aspect-square flex-col items-center justify-center p-4">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
							<Camera className="h-8 w-8 text-white" />
						</div>
						<div className="text-xl font-bold text-pink-600">Instagram</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>

				{/* TikTok Card */}
				<Link
					href="/tiktok"
					className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-zinc-400/20 to-zinc-600/20 opacity-50"></div>
					<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-zinc-500/10"></div>
					<div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-zinc-500/20"></div>

					<div className="relative flex aspect-square flex-col items-center justify-center p-4">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
							<Video className="h-8 w-8 text-white" />
						</div>
						<div className="text-xl font-bold text-zinc-600">TikTok</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>
			</div>
		</main>
	)
}
