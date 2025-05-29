"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

interface Params {
	displayBackButton?: boolean
	title?: string
}

export function Header({ displayBackButton, title }: Params) {
	const router = useRouter()

	return (
		<header className="p-4 border-b bg-gradient-to-r from-primary to-primary-foreground flex items-center">
			{displayBackButton && (
				<Button onClick={() => router.back()} className="text-white mr-4">
					<ArrowLeft className="h-6 w-6" />
				</Button>
			)}

			<h1 className="text-2xl font-bold text-center text-white">{title || process.env.NEXT_PUBLIC_WEBSITE_NAME}</h1>
		</header>
	)
}