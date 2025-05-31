import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatCommentDate(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

	if (diffInHours < 1) {
		return "Agora há pouco"
	} else if (diffInHours < 24) {
		return `${diffInHours}h atrás`
	} else {
		const diffInDays = Math.floor(diffInHours / 24)
		return `${diffInDays}d atrás`
	}
}