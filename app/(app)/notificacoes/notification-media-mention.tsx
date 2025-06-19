import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatEventDate } from "@/lib/dates"
import { NotificationData, NotificationDataMediaMention } from "@/types/api"
import { AtSign, Eye } from "lucide-react"
import Link from "next/link"

interface Params {
	notification: NotificationData,
	markAsExecuted: (notification: NotificationData) => void
}

export function NotificationMediaMention({ notification, markAsExecuted }: Params) {
	const data = JSON.parse(notification.Data) as NotificationDataMediaMention

	return (
		<div
			className={`p-4 border-b last:border-b-0 ${!notification.ReadAt ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
		>
			<div className="flex items-start gap-3">
				{/* Icon and avatar */}
				<div className="relative">
					<Avatar className="h-10 w-10">
						<AvatarImage src={data.Sender.AvatarUrl || "/placeholder.svg"} alt={data.Sender.Handle} />
						<AvatarFallback>{data.Sender.Handle.substring(0, 2)}</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
						<AtSign className="h-5 w-5 text-purple-500" />
					</div>
					{!notification.ReadAt && (
						<div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-blue-500 rounded-full"></div>
					)}
				</div>

				{/* Content */}
				<div className="flex flex-col gap-3">
					<h3 className="font-medium">Você foi mencionado em uma foto</h3>

					<p className="text-sm text-gray-600 dark:text-gray-300">
						{data.Sender.Handle} mencionou você em uma foto.
					</p>

					{/* Action buttons */}
					<Link href={`/galeria?mediaId=${data.MediaId}`}>
						<Button
							size="sm"
							variant="default"
							className="flex items-center gap-1 text-white"
							onClick={() => markAsExecuted(notification)}
						>
							<Eye size={16} />
							Ver Foto
						</Button>
					</Link>

					<span className="text-xs text-gray-500">{formatEventDate(notification.Timestamp)}</span>
				</div>
			</div>
		</div>
	)
}