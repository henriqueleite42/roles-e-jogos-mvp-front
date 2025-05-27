import Link from "next/link"
import { Dice6, Calendar, MapPin, Download, Camera, Video, MessageCircle, Image } from "lucide-react"

export default function HomePage() {
	return (
		<main className="flex-1 p-4">
			<div className="grid grid-cols-2 gap-6 max-w-md mx-auto pt-4 md:grid-cols-4 md:max-w-5xl">
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
						<div className="text-xl font-bold text-sky-600 text-center">Jogos</div>
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
						<div className="text-xl font-bold text-purple-600 text-center">Eventos</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>

				{/* Locais Card */}
				<Link
					href="/locais"
					className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-orange-600/20 opacity-50"></div>
					<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/10"></div>
					<div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-orange-500/20"></div>

					<div className="relative flex aspect-square flex-col items-center justify-center p-4">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
							<MapPin className="h-8 w-8 text-white" />
						</div>
						<div className="text-xl font-bold text-orange-600 text-center">Locais</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>

				{/* Gallery Card */}
				<Link
					href="/galeria"
					className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-teal-600/20 opacity-50"></div>
					<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-teal-500/10"></div>
					<div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-teal-500/20"></div>

					<div className="relative flex aspect-square flex-col items-center justify-center p-4">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
							<Image className="h-8 w-8 text-white" />
						</div>
						<div className="text-xl font-bold text-teal-600 text-center">Galeria</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>

				{/* Import Card */}
				<Link
					href="/jogos/importar"
					className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 opacity-50"></div>
					<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-yellow-500/10"></div>
					<div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-yellow-500/20"></div>

					<div className="relative flex aspect-square flex-col items-center justify-center p-4">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
							<Download className="h-8 w-8 text-white" />
						</div>
						<div className="text-xl font-bold text-yellow-600 text-center">Cadastrar Jogos</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>

				{/* Whatsapp Card */}
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
						<div className="text-xl font-bold text-green-600 text-center">Whatsapp</div>
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
						<div className="text-xl font-bold text-pink-600 text-center">Instagram</div>
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
						<div className="text-xl font-bold text-zinc-600 text-center">TikTok</div>
						<div className="absolute bottom-0 h-1 w-1/2 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600 transition-all duration-300 group-hover:w-3/4"></div>
					</div>
				</Link>
			</div>
		</main>
	)
}
