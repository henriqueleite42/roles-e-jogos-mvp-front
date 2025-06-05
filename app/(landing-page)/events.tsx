"use client"

import { ResponseEvents } from "@/types/api";
import { Calendar } from "lucide-react";
import { formatEventDate } from "../(app)/eventos/utils";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";

export function Events() {
	const { data, isPending } = useQuery<ResponseEvents>({
		queryKey: ["events-home"],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/next?limit=3`)

			if (!response.ok) {
				console.error(`Erro ao pegar dados da API: ${response.status}`)
				return {
					Data: []
				}
			}

			return response.json()
		},
	})

	if (isPending) {
		return <Loading />
	}

	return (
		<div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
			{(data?.Data || []).map((event) => (
				<div key={event.Id} className="flex flex-col space-y-3 rounded-lg border bg-white p-6 shadow-sm">
					<div className="flex items-center space-x-3">
						<Calendar className="h-5 w-5 text-primary" />
						<h3 className="text-xl font-bold">{event.Name}</h3>
					</div>
					<p className="text-sm text-gray-500">Data: {formatEventDate(event.StartDate)}</p>
					<p className="text-sm text-gray-500">Local: {event.Location.Name}</p>
					{/* <Button className="mt-2 bg-primary hover:bg-red-600">Confirmar presença</Button> */}
				</div>
			))}
		</div>
	)
}