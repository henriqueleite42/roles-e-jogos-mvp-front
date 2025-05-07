"use client"

import { useState } from "react"
import { Check, Edit2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
	username: string
}

export function Username({ username }: Props) {
	const [newUsername, setNewUsername] = useState(username)
	const [isEditingUsername, setIsEditingUsername] = useState(false)

	const handleUsernameSubmit = () => {
		setIsEditingUsername(false)
	}

	if (isEditingUsername) {
		return (
			<div className="flex items-center gap-2 mb-4">
				<Input
					value={newUsername}
					onChange={(e) => setNewUsername(e.target.value)}
					className="max-w-[200px]"
				/>
				<Button size="icon" variant="ghost" onClick={handleUsernameSubmit}>
					<Check className="h-4 w-4" />
				</Button>
			</div>
		)
	} else {
		return (
			<div className="flex items-center gap-2 mb-4">
				<h2 className="text-xl font-bold">{username}</h2>
				<Button
					size="icon"
					variant="ghost"
					className="h-8 w-8"
					onClick={() => {
						setNewUsername(username)
						setIsEditingUsername(true)
					}}
				>
					<Edit2 className="h-4 w-4" />
				</Button>
			</div>
		)
	}
}