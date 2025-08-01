import { EventData, EventTicketBuyer } from "@/types/api"

export function getAvailableSpots(event: EventData, ticketBuyers: Array<EventTicketBuyer>) {
	if (!event || !ticketBuyers) return {
		confirmationsCount: 0,
		availableSpots: 0,
		isFull: true,
	}

	const confirmationsCount = ticketBuyers.length
	const availableSpots = event.Capacity ?
		event.Capacity - confirmationsCount
		: Number.MAX_VALUE
	const isFull = availableSpots <= 0

	return {
		confirmationsCount,
		availableSpots,
		isFull,
	}
}
