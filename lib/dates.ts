export function formatDate(dateString: string): string {
	const date = new Date(dateString)
	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date)
}

export function formatDateTime(dateString: string): string {
	const date = new Date(dateString)
	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date)
}

export function getTimeSince(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

	if (diffInDays === 0) return "Hoje"
	if (diffInDays === 1) return "Ontem"
	if (diffInDays < 7) return `${diffInDays} dias atrás`
	if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`
	return `${Math.floor(diffInDays / 30)} meses atrás`
}

export function formatEventDate(dateString: string): string {
	const date = new Date(dateString)

	// Format date: DD/MM/YYYY
	const day = date.getDate().toString().padStart(2, "0")
	const month = (date.getMonth() + 1).toString().padStart(2, "0")
	const year = date.getFullYear()

	// Format time: HH:MM
	const hours = date.getHours().toString().padStart(2, "0")
	const minutes = date.getMinutes().toString().padStart(2, "0")

	return `${day}/${month}/${year} às ${hours}:${minutes}`
}
