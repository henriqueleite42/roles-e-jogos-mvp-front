"use client"

import { LogOut } from "lucide-react"
import router from "next/router"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"

export function Logout() {
	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
				method: "POST",
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`failed to logout ${response.status}`)
			}
		},
		onSuccess: () => {
			router.push("/conta")
		},
		onError: (error) => {
			console.error('Error login out:', error)
		},
	})

	return (
		<Button
			variant="outline"
			className="w-full bg-red-50 border-red-200 text-red-500 hover:bg-red-100 hover:text-red-600"
			disabled={isPending}
			onClick={() => mutate()}
		>
			<LogOut className="h-4 w-4 mr-2" /> Sair da conta
		</Button>
	)
}