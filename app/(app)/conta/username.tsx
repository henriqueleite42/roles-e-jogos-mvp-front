"use client";

import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Check, Edit2, Loader2 } from "lucide-react";
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from 'react-hook-form';

interface Props {
	username: string;
}

const updateUsernameSchema = z.object({
	NewHandle: z
		.string()
		.min(3, 'Seu username precisa ter pelo menos 3 caracteres')
		.max(16, 'Seu username pode ter no maximo 16 caracteres')
		.regex(/^[a-z0-9_.]*$/, "Seu username pode conter apenas letras minusculas, numeros, _ e ."),
}).refine((data) => {
	if (!data.NewHandle) return false;

	if (
		data.NewHandle.startsWith("_") ||
		data.NewHandle.startsWith(".") ||
		data.NewHandle.endsWith("_") ||
		data.NewHandle.endsWith(".")
	) {
		return false;
	}

	return true;
}, {
	message: "Seu username não pode começar ou terminar com _ ou .",
	path: ["NewHandle"]
});
type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;

export function Username({ username }: Props) {
	const router = useRouter();

	const [isEditingUsername, setIsEditingUsername] = useState(false);

	// Initialize form
	const form = useForm<UpdateUsernameInput>({
		resolver: zodResolver(updateUsernameSchema),
		defaultValues: {
			NewHandle: username,
		},
	})

	const mutation = useMutation({
		mutationFn: async (body: UpdateUsernameInput) => {
			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/handle', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text();

				if (error.includes("conflict")) {
					throw new Error("Alguém já está usando esse username");
				}

				console.error(error);
				throw new Error(error);
			}

			setIsEditingUsername(false);
			router.refresh();
		},
	});

	const onSubmit = (data: UpdateUsernameInput) => {
		mutation.mutate(data);
	};

	if (isEditingUsername) {
		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} >
					<div className="flex items-start gap-2 mb-4">
						<FormField
							control={form.control}
							name="NewHandle"
							render={({ field }) => (
								<FormItem>
									<FormLabel hidden>Novo username</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="Ex: joaosilva"
											onChange={(e) => {
												const onlyAllowed = e.target.value.replace(/[^a-z0-9_.]/g, '');

												field.onChange(onlyAllowed);
											}}
										/>
									</FormControl>
									<FormDescription>
										Use apenas <strong>letras minúsculas</strong>, <strong>números</strong>, <strong>_</strong> e <strong>.</strong>
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type='submit' size="icon" variant="ghost" disabled={mutation.isPending}>
							{mutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin text-white" />
							) : (
								<Check className="h-4 w-4" />
							)}
						</Button>
					</div>
					{mutation.isPending && <p>Atualizando...</p>}
					{mutation.isError && <p className="text-red-600">{(mutation.error as Error).message}</p>}
				</form>
			</Form>
		);
	} else {
		return (
			<div className="flex items-center gap-2 mb-4">
				<h2 className="text-xl font-bold">{username}</h2>
				<Button
					size="icon"
					variant="ghost"
					className="h-8 w-8"
					onClick={() => {
						setIsEditingUsername(true);
					}}
				>
					<Edit2 className="h-4 w-4" />
				</Button>
			</div>
		);
	}
}
