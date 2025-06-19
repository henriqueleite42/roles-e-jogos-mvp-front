import { Button } from "@/components/ui/button"
import { formatEventDate } from "@/lib/dates"
import { NotificationData, NotificationDataEventCanceled } from "@/types/api"
import { Eye, CalendarX } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Params {
	notification: NotificationData,
	markAsExecuted: (notification: NotificationData) => void
}

export function NotificationEventCanceled({ notification, markAsExecuted }: Params) {
	const data = JSON.parse(notification.Data) as NotificationDataEventCanceled

	return (
		<div
			className={`p-4 border-b last:border-b-0 ${!notification.ReadAt ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
		>
			<div className="flex items-start gap-3">
				{/* Icon and avatar */}
				<div className="relative">
					<div className="relative h-10 w-10 rounded-md overflow-hidden">
						<Image
							src={data.Event.IconUrl || "/placeholder.svg"}
							alt={data.Event.Name || "Imagem"}
							fill
							className="object-cover"
						/>
					</div>
					<div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
						<CalendarX className="h-5 w-5 text-red-500" />
					</div>
					{!notification.ReadAt && (
						<div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-blue-500 rounded-full"></div>
					)}
				</div>

				{/* Content */}
				<div className="flex flex-col gap-3">
					<h3 className="font-medium">Evento cancelado</h3>

					<p className="text-sm text-gray-600 dark:text-gray-300">
						O evento "{data.Event.Name}" que aconteceria em {formatEventDate(data.Event.StartDate)} foi cancelado pelo organizador.
					</p>

					{/* Action buttons */}
					<Link href={`/eventos/${data.Event.Slug}`}>
						<Button
							size="sm"
							variant={"default"}
							className="flex items-center gap-1 text-white"
							onClick={() => markAsExecuted(notification)}
						>
							<Eye size={16} />
							Ver Detalhes
						</Button>
					</Link>

					<span className="text-xs text-gray-500">{formatEventDate(notification.Timestamp)}</span>
				</div>
			</div>
		</div>
	)
}