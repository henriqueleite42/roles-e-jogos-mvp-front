"use client"

import { useRouter, usePathname } from "next/navigation"
import { MapPin, Dice6Icon as Dice, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
export function BottomNavbar() {
	const pathname = usePathname()
	const router = useRouter()

	return (
		<div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
			<div className="container mx-auto">
				<div className="flex justify-around items-center h-16">
					<button
						onClick={() => router.push("/")}
						className={cn(
							"flex flex-col items-center justify-center w-full h-full",
							pathname === "/" ? "text-primary" : "text-muted-foreground",
						)}
					>
						<Dice className="h-5 w-5 mb-1" />
						<span className="text-xs">Jogos/RPGs</span>
					</button>

					<button
						onClick={() => router.push("/mapa")}
						className={cn(
							"flex flex-col items-center justify-center w-full h-full",
							pathname === "/mapa" ? "text-primary" : "text-muted-foreground",
						)}
					>
						<MapPin className="h-5 w-5 mb-1" />
						<span className="text-xs">Mapa</span>
					</button>

					<button
						onClick={() => router.push("/eventos")}
						className={cn(
							"flex flex-col items-center justify-center w-full h-full",
							pathname === "/eventos" ? "text-primary" : "text-muted-foreground",
						)}
					>
						<Calendar className="h-5 w-5 mb-1" />
						<span className="text-xs">Eventos</span>
					</button>
				</div>
			</div>
		</div>
	)
}
