import { formatEventDate } from "@/lib/dates";
import { toPascalCase } from "@/lib/string";
import { EventData } from "@/types/api";

export function getShareData(event: EventData) {
	const weekday = toPascalCase(
		new Date(event.StartDate).toLocaleDateString('pt-BR', { weekday: 'long' })
	)

	return {
		title: event.Name,
		text: `${event.Name} - ${weekday}, ${formatEventDate(event.StartDate)}`,
		url: window.location.href,
	}
}