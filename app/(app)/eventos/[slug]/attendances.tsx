"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Profile, AttendanceStatus, Event, EventAttendanceStatus } from "@/types/api"
import { CircleArrowRight, Check, Info, HelpCircle, X, ThumbsDown, ThumbsUp } from "lucide-react"
import router from "next/router"
import { getAvailableSpots } from "./utils"
import { useMutation } from "@tanstack/react-query"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Params {
	event: Event
	account: Profile | null
}

interface ConfirmAttendanceInput {
	EventId: number
	Confirmation: EventAttendanceStatus
}

// Attendance status configuration
const attendanceConfig = {
	GOING: {
		label: "Vou participar",
		icon: ThumbsUp,
		color: "text-green-600",
		bgColor: "bg-green-100",
		borderColor: "border-green-200",
		hoverColor: "hover:bg-green-200",
	},
	NOT_GOING: {
		label: "Não vou",
		icon: ThumbsDown,
		color: "text-red-600",
		bgColor: "bg-red-100",
		borderColor: "border-red-200",
		hoverColor: "hover:bg-red-200",
	},
	MAYBE: {
		label: "Talvez",
		icon: HelpCircle,
		color: "text-amber-600",
		bgColor: "bg-amber-100",
		borderColor: "border-amber-200",
		hoverColor: "hover:bg-amber-200",
	},
}

export function Attendances({ event, account }: Params) {
	const mutation = useMutation({
		mutationFn: async (body: ConfirmAttendanceInput) => {
			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/events/attendance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text()
				throw new Error(error)
			}
		},
		onSuccess: () => {
			window.location.reload()
		},
		onError: (error) => {
			console.error(error);
		},
	});

	function updateAttendance(eventId: number, status: any) {
		mutation.mutate({
			EventId: eventId,
			Confirmation: status
		});
	}

	// Function to get attendance button based on current status
	const getAttendanceButton = (event: Event, account: Profile | null) => {
		if (!account?.AccountId) {
			return (
				<Button
					variant="outline"
					size="sm"
					className="gap-1 border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
					onClick={() => router.push("/conta")}
				>
					<CircleArrowRight />
					Faca login para poder participar
				</Button>
			)
		}

		const userAttendance = event.Attendances.find(a => a.AccountId === account?.AccountId)
		const { isFull } = getAvailableSpots(event)

		// If the event is full and user is not already going, disable the button
		const isDisabled = (isFull && event.Capacity && userAttendance?.Status !== "GOING") as boolean

		if (userAttendance) {
			// User has already set an attendance status
			const config = attendanceConfig[userAttendance?.Status]

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className={cn("gap-2 border", config.borderColor, config.bgColor, config.color, config.hoverColor)}
						>
							<config.icon className="h-4 w-4" />
							{config.label}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{Object.entries(attendanceConfig)
							.filter(([status]) => status != userAttendance?.Status)
							.map(([status, config]) => (
								<DropdownMenuItem
									key={status}
									onClick={() => updateAttendance(event.Id, status as AttendanceStatus)}
									disabled={status === "GOING" && isDisabled}
									className={cn(
										"gap-2",
										status === userAttendance?.Status ? "font-medium" : "",
										status === userAttendance?.Status ? config.color : "",
									)}
								>
									<config.icon className="h-4 w-4" />
									{config.label}
									{status === userAttendance?.Status && <Check className="h-4 w-4 ml-auto" />}
								</DropdownMenuItem>
							))}
						{/* <DropdownMenuItem onClick={() => updateAttendance(event.Id, null)} className="gap-2 text-gray-600">
							<X className="h-4 w-4" />
							Remover resposta
						</DropdownMenuItem> */}
					</DropdownMenuContent>
				</DropdownMenu>
			)
		}

		if (isFull && event.Capacity) {
			return (
				<>
					<Info className="h-4 w-4 mr-2 text-muted-foreground" />
					<span className="text-red-600 font-medium">
						Evento lotado
					</span>
				</>
			)
		}

		// User hasn't set an attendance status yet
		return (
			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					className="gap-1 border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
					onClick={() => updateAttendance(event.Id, "GOING")}
					disabled={isDisabled}
				>
					<Check className="h-4 w-4" />
					Vou
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="gap-1 border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
					disabled={isDisabled}
					onClick={() => updateAttendance(event.Id, "MAYBE")}
				>
					<HelpCircle className="h-4 w-4" />
					Talvez
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="gap-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
					disabled={isDisabled}
					onClick={() => updateAttendance(event.Id, "NOT_GOING")}
				>
					<X className="h-4 w-4" />
					Não vou
				</Button>
			</div>
		)
	}

	return (<>
		{getAttendanceButton(event, account)}
	</>)
}