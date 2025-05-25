import { Event } from "@/types/api";
import { formatEventDate } from "../utils";
import { Calendar, Clock } from "lucide-react";

export function Dates({ event }: { event: Event }) {
	return (

		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Calendar className="h-5 w-5 text-muted-foreground" />
				<div>
					<p className="font-medium">Início</p>
					<p className="text-sm text-muted-foreground">{formatEventDate(event.StartDate)}</p>
				</div>
			</div>

			{event.EndDate && (
				<div className="flex items-center gap-2">
					<Clock className="h-5 w-5 text-muted-foreground" />
					<div>
						<p className="font-medium">Término</p>
						<p className="text-sm text-muted-foreground">{formatEventDate(event.EndDate)}</p>
					</div>
				</div>
			)}
		</div>
	)
}