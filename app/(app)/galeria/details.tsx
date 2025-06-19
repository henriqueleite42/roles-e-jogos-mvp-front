"use client"

import { formatEventDate } from "@/lib/dates"
import { MediaData } from "@/types/api"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { Calendar, Gamepad2, Users, MapPin, X, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import Loading from "@/components/ui/loading"

interface Params {
	isLoading: boolean
	image: MediaData
	close: () => void
	goToPrevious: () => void
	canGoToPrevious: boolean
	goToNext: () => void
	canGoToNext: boolean
}

export function ImageDetails({ image, canGoToNext, canGoToPrevious, close, goToNext, goToPrevious, isLoading }: Params) {
	if (isLoading) {
		return (
			<div className="fixed inset-0 bg-black/95 z-50 flex items-center flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-6 overflow-auto">
				<Loading />
			</div>
		)
	}

	return (
		<div className="fixed inset-0 bg-black/95 z-50 flex items-center flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-6 overflow-auto">
			{/* Close button */}
			<Button
				variant="ghost"
				size="icon"
				className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
				onClick={close}
			>
				<X className="h-6 w-6" />
			</Button>

			{/* Main content */}
			{/* Image */}
			<div
				className="relative flex-shrink-0"
			// onTouchStart={handleTouchStart}
			// onTouchMove={handleTouchMove}
			// onTouchEnd={handleTouchEnd}
			// onClick={() => handleDoubleTap(selectedImage)}
			>
				<NextImage
					src={image.Url || "/placeholder.svg"}
					alt="image"
					width={image.Width}
					height={image.Height}
					className="max-w-full rounded-lg"
					priority
				/>
			</div>


			{/* Navigation buttons */}
			<div className="flex justify-between w-full">
				<Button
					variant="ghost"
					size="icon"
					className="z-10 text-white hover:bg-white/10"
					onClick={goToPrevious}
					disabled={canGoToPrevious}
				>
					<ChevronLeft className="h-8 w-8" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					className="z-10 text-white hover:bg-white/10"
					onClick={goToNext}
					disabled={canGoToNext}
				>
					<ChevronRight className="h-8 w-8" />
				</Button>
			</div>

			{/* Image details */}
			<div className="lg:max-w-md w-full text-white space-y-6">
				<div>
					<p className="text-white/80 leading-relaxed">{image.Description}</p>
				</div>

				<div className="flex items-center gap-3">
					<Avatar className="w-10 h-10">
						<AvatarImage
							src={image.Owner.AvatarUrl || "/placeholder.svg"}
							alt={image.Owner.Handle}
						/>
						<AvatarFallback>{image.Owner.Handle.substring(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-medium">{image.Owner.Handle}</p>
						<div className="flex items-center gap-2 text-sm text-white/70">
							<Calendar className="h-3 w-3" />
							<span>{formatEventDate(image.CreatedAt)}</span>
						</div>
					</div>
				</div>

				{/* Related Information Section */}
				{(image.Game || image.Event || image.Location) && (
					<div className="space-y-3">
						<h3 className="text-lg font-semibold text-white/90">Informações Relacionadas</h3>

						{/* Game Information */}
						{image.Game && (
							<Link href={"/jogos/" + image.Game.Slug} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
								<div className="flex items-center gap-2 flex-1">
									<Gamepad2 className="h-4 w-4 text-green-400 flex-shrink-0" />
									<div className="flex items-center gap-2 min-w-0">
										{image.Game.IconUrl && (
											<div className="w-6 h-6 relative flex-shrink-0">
												<NextImage
													src={image.Game.IconUrl || "/placeholder.svg"}
													alt={image.Game.Name}
													fill
													className="object-cover rounded"
												/>
											</div>
										)}
										<div className="min-w-0">
											<p className="text-sm font-medium text-white truncate">{image.Game.Name}</p>
										</div>
									</div>
								</div>
							</Link>
						)}

						{/* Event Information */}
						{image.Event && (
							<Link href={"/eventos/" + image.Event.Slug} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
								<div className="flex items-center gap-2 flex-1">
									<Users className="h-4 w-4 text-purple-400 flex-shrink-0" />
									<div className="min-w-0">
										<p className="text-sm font-medium text-white truncate">{image.Event.Name}</p>
									</div>
								</div>
							</Link>
						)}

						{/* Location Information */}
						{image.Location && (
							<div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
								<div className="flex items-center gap-2 flex-1">
									<MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
									<div className="min-w-0">
										<p className="text-sm font-medium text-white truncate">{image.Location.Name}</p>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* <div className="flex items-center gap-4">
				<Button
					variant="ghost"
					className={cn(
						"text-white hover:bg-white/10 gap-2",
						selectedImage.isLiked && "text-red-400 hover:text-red-300",
					)}
					onClick={() => handleLike(selectedImage.Id)}
				>
					<Heart className={cn("h-5 w-5", selectedImage.isLiked && "fill-current")} />
					<span>{selectedImage.likes}</span>
				</Button>
			</div> */}

				<div className="text-sm text-white/60">
					<p className="mt-1">💡 Dica: Toque duas vezes para curtir</p>
				</div>
			</div>
		</div>
	)
}