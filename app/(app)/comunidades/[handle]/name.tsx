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
import { CommunityData, CommunityMemberData, Profile } from '@/types/api';

interface Props {
	member?: CommunityMemberData
	community: CommunityData
}

const updateNameSchema = z.object({
	NewName: z
		.string()
		.max(64, 'Seu username pode ter no maximo 64 caracteres')
})
type UpdateNameInput = z.infer<typeof updateNameSchema>;

export function Name({ community, member }: Props) {
	const router = useRouter();

	const [isEditingName, setIsEditingName] = useState(false);

	// Initialize form
	const form = useForm<UpdateNameInput>({
		resolver: zodResolver(updateNameSchema),
		defaultValues: {
			NewName: community.Name || "",
		},
	})

	const mutation = useMutation({
		mutationFn: async (body: UpdateNameInput) => {
			if (body.NewName === community.Name) return

			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/me', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					Name: body.NewName
				}),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text();
				console.error(error);
				throw new Error(error);
			}
		},
		onSuccess: () => {
			setIsEditingName(false);
			router.refresh();
		}
	});

	const onSubmit = (data: UpdateNameInput) => {
		mutation.mutate(data);
	};

	if (isEditingName) {
		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} >
					<div className="flex items-start gap-2 mb-4">
						<FormField
							control={form.control}
							name="NewName"
							render={({ field }) => (
								<FormItem>
									<FormLabel hidden>Novo nome</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="Ex: João Silva"
										/>
									</FormControl>
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
			<div className="flex items-center gap-2 mb-1">
				{
					community.Name ? (
						<h1 className="text-2xl font-bold">{community.Name}</h1>
					) : (
						<h1 className="text-2xl font-bold italic">Sem nome definido</h1>
					)
				}
				{/* {member?.IsOwner && (
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8"
						onClick={() => {
							setIsEditingName(true);
						}}
					>
						<Edit2 className="h-4 w-4" />
					</Button>
				)} */}
			</div>
		);
	}
}
