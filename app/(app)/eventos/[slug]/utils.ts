import { Event, EventAttendance } from "@/types/api"

export function getAvailableSpots(event: Event) {
	if (!event || !event.Attendances) return {
		confirmations: [],
		maybes: [],
		notGoing: [],
		confirmationsCount: 0,
		availableSpots: 0,
		isFull: true,
	}

	const confirmations = [] as Array<EventAttendance>
	const maybes = [] as Array<EventAttendance>
	const notGoing = [] as Array<EventAttendance>

	for (const attendance of event.Attendances) {
		if (attendance.Status === "GOING") {
			confirmations.push(attendance)
		}
		if (attendance.Status === "MAYBE") {
			maybes.push(attendance)
		}
		if (attendance.Status === "NOT_GOING") {
			notGoing.push(attendance)
		}
	}

	const confirmationsCount = confirmations.length
	const availableSpots = event.Capacity ?
		event.Capacity - confirmationsCount
		: -1
	const isFull = availableSpots <= 0

	return {
		confirmations,
		maybes,
		notGoing,
		confirmationsCount,
		availableSpots,
		isFull,
	}
}
