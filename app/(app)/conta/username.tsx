"use client"

import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react"
import { useRouter } from 'next/navigation';
import { Check, Edit2, Loader2 } from "lucide-react"
import { z } from 'zod';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form';

interface Props {
	username: string
}

const updateUsernameSchema = z.object({
	NewHandle: z
		.string()
		.min(3, 'Seu username precisa ter pelo menos 3 caracteres')
		.max(16, 'Seu username pode ter no maximo 16 caracteres')
		.regex(/^[a-z0-9]*$/, "Seu username pode conter apenas letras e numeros"),
});
type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;

export function Username({ username }: Props) {
	const router = useRouter();

	const [isEditingUsername, setIsEditingUsername] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<UpdateUsernameInput>({
		resolver: zodResolver(updateUsernameSchema),
	});

	const mutation = useMutation({
		mutationFn: async (body: UpdateUsernameInput) => {
			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/handle', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text()

				if (error.includes("conflict")) {
					throw new Error("Alguém já está usando esse username")
				}

				console.error(error);
				throw new Error(error)
			}

			setIsEditingUsername(false)
			router.refresh()
		},
	});

	const onSubmit = (data: UpdateUsernameInput) => {
		mutation.mutate(data);
	};

	if (isEditingUsername) {
		return (
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="flex items-center gap-2 mb-4">
					<Input
						{...register('NewHandle')}
						placeholder="Novo username"
						disabled={mutation.isPending}
						className="max-w-[200px]"
					/>
					<Button type='submit' size="icon" variant="ghost" disabled={mutation.isPending}>

						{mutation.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin text-white" />
						) : (
							<Check className="h-4 w-4" />
						)}
					</Button>

				</div>

				{errors.NewHandle && (
					<p className="text-red-500 text-sm mt-1">{errors.NewHandle.message}</p>
				)}
				{mutation.isPending && <p>Atualizando...</p>}
				{mutation.isError && <p className="text-red-600">{mutation.error.message}</p>}
			</form>
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
						setValue("NewHandle", username)
						setIsEditingUsername(true)
					}}
				>
					<Edit2 className="h-4 w-4" />
				</Button>
			</div>
		)
	}
}