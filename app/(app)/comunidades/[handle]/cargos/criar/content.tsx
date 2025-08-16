"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CommunityData, CommunityPermissions } from "@/types/api"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { isBitSet } from "@/lib/permissions"
import { Switch } from "@/components/ui/switch"
import { categories } from "../[id]/content"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';

interface Props {
	community: CommunityData
}

const roleSchema = z.object({
	name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(64, "Nome deve ter no máximo 64 caracteres"),
	// description: z
	// 	.string()
	// 	.min(10, "Descrição deve ter pelo menos 10 caracteres")
	// 	.max(200, "Descrição deve ter no máximo 200 caracteres"),
	permissions: z.array(z.number().int()),
})

type RoleFormData = z.infer<typeof roleSchema>

export default function Content({ community }: Props) {
	const { toast } = useToast()
	const router = useRouter();

	const form = useForm<RoleFormData>({
		resolver: zodResolver(roleSchema),
		defaultValues: {
			name: "",
			permissions: [],
		},
	})

	const mutation = useMutation({
		mutationFn: async ({ name, permissions }: RoleFormData) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/roles`, {
				method: 'POST',
				body: JSON.stringify({
					CommunityId: community.Id,
					Name: name,
					Permissions: permissions,
				}),
				headers: { 'Content-Type': 'application/json' },
				credentials: "include"
			})

			if (!res.ok) {
				console.error(await res.text())
				throw new Error(`Fail to update member role ${res.status}`)
			}
		},
		onSuccess: () => {
			router.push(`/comunidades/${community.Handle}/cargos`)
		},
		onError: (error) => {
			console.error('Error updating member role:', error)
			toast({
				title: "Erro",
				description: "Não foi possível criar o cargo.",
				variant: "destructive",
			})
		},
	})

	const onSubmit = async (data: RoleFormData) => {
		mutation.mutate(data);
	}

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Role Basic Info Card */}
					<Card>
						<CardHeader>
							<CardTitle>Informações Básicas</CardTitle>
							<CardDescription>Configure as informações principais do cargo</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nome do Cargo</FormLabel>
											<FormControl>
												<Input placeholder="Ex: Moderador, Organizador..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/*
								<FormField
									control={form.control}
									name="color"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Cor do Cargo</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Selecione uma cor" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{roleColors.map((color) => (
														<SelectItem key={color.value} value={color.value}>
															<div className="flex items-center gap-2">
																<div className={`w-4 h-4 rounded-full ${color.class}`} />
																{color.label}
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/> */}
							</div>

							{/* <FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Descrição</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Descreva as responsabilidades e função deste cargo..."
												className="min-h-[80px]"
												{...field}
											/>
										</FormControl>
										<FormDescription>Uma breve descrição sobre as responsabilidades deste cargo</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/> */}
						</CardContent>
					</Card>

					{/* Permission Categories */}
					<div className="space-y-6">
						{categories.map((category) => {
							return (
								<Card key={category.name}>
									<CardHeader>
										<div className="flex items-center gap-3">
											<div className="p-2 bg-primary rounded-lg">
												<category.icon className="h-5 w-5 text-white" />
											</div>
											<div className="flex-1">
												<CardTitle className="text-lg">{category.name}</CardTitle>
												<CardDescription>{category.description}</CardDescription>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{category.permissions.map((permission, index) => (
												<FormField
													key={permission.index}
													control={form.control}
													name="permissions"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Nome do Cargo</FormLabel>
															<FormControl>
																<div>
																	<div className="flex items-start gap-3">
																		<Switch
																			id={String(permission.index)}
																			checked={field.value.includes(permission.index) || field.value.includes(CommunityPermissions.Admin)}
																			onCheckedChange={(checked) => {
																				if (checked) {
																					form.setValue("permissions", [...field.value, permission.index], { shouldValidate: true })
																				} else {
																					form.setValue("permissions", field.value.filter(n => n !== permission.index), { shouldValidate: true })
																				}
																			}}
																			className="mt-1"
																			disabled={
																				permission.index != CommunityPermissions.Admin &&
																				field.value.includes(CommunityPermissions.Admin)
																			}
																		/>
																		<div className="flex-1">
																			<div className="flex items-center gap-2">
																				<permission.icon className="h-4 w-4 text-muted-foreground" />
																				<FormLabel htmlFor={String(permission.index)} className="font-medium cursor-pointer">
																					{permission.name}
																				</FormLabel>
																			</div>
																			<p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
																		</div>
																	</div>
																	{index < category.permissions.length - 1 && <Separator className="mt-4" />}
																</div>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

											))}
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>

					{/* Submit Button */}
					<div className="flex justify-end">
						<Button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 text-white">
							<Save className="h-4 w-4" />
							{mutation.isPending ? "Criando Cargo..." : "Criar Cargo"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	)
}
