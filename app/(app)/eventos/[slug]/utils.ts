import { Event, EventAttendanceData } from "@/types/api"

export function getAvailableSpots(event: Event, attendances: Array<EventAttendanceData>) {
	if (!event || !attendances) return {
		confirmations: [],
		maybes: [],
		notGoing: [],
		confirmationsCount: 0,
		availableSpots: 0,
		isFull: true,
	}

	const confirmations = [] as Array<EventAttendanceData>
	const maybes = [] as Array<EventAttendanceData>
	const notGoing = [] as Array<EventAttendanceData>

	for (const attendance of attendances) {
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
		: Number.MAX_VALUE
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
