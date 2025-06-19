import { LudopediaIcon } from "@/components/icons/ludopedia"
import { formatEventDate } from "@/lib/dates"
import { NotificationData, NotificationDataGamesCollectionFinish } from "@/types/api"
import { PuzzleIcon } from "lucide-react"

interface Params {
	notification: NotificationData,
	markAsExecuted: (notification: NotificationData) => void
}

export function NotificationGamesCollectionFinish({ notification, markAsExecuted }: Params) {
	const data = JSON.parse(notification.Data) as NotificationDataGamesCollectionFinish

	return (
		<div
			className={`p-4 border-b last:border-b-0 ${!notification.ReadAt ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
		>
			<div className="flex items-start gap-3">
				{/* Icon and avatar */}
				<div className="relative">
					<div className="relative h-10 w-10 rounded-md overflow-hidden">
						<div className="bg-ludopedia p-2 rounded-full">
							<LudopediaIcon className="h-5 w-5 text-white" />
						</div>
					</div>
					<div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
						<PuzzleIcon className="h-5 w-5 text-orange-500" />
					</div>
					{!notification.ReadAt && (
						<div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-blue-500 rounded-full"></div>
					)}
				</div>

				{/* Content */}
				<div className="flex flex-col gap-3">
					<h3 className="font-medium">
						{
							data.Status === "COMPLETED" ? (
								"Sua coleção foi importada com sucesso"
							) : (
								"Falha ao importar sua coleção"
							)
						}
					</h3>

					<p className="text-sm text-gray-600 dark:text-gray-300">
						{
							data.Status === "COMPLETED" ? (
								"Sua coleção da Ludopedia já está disponivel em nosso site!"
							) : (
								"Não foi possivel importar sua coleção da Ludopedia. Por favor, entre em contato com o suporte."
							)
						}
					</p>

					<span className="text-xs text-gray-500">{formatEventDate(notification.Timestamp)}</span>
				</div>
			</div>
		</div>
	)
}