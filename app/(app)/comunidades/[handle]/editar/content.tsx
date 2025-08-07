"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useMutation } from "@tanstack/react-query"
import { CommunityData } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"

const optionalUrl = z
	.string()
	.trim()
	.optional()
	.nullable()
	.refine(val => !val || z.string().url().safeParse(val).success, {
		message: "URL inválida.",
	});

// Form schema with validation
const formSchema = z.object({
	Description: z.string().max(1024, {
		message: "A descrição deve ter no maximo 1024 caracteres.",
	}),
	AffiliationType: z.enum(["PUBLIC", "INVITE_ONLY"]),
	WebsiteUrl: optionalUrl,
	WhatsappUrl: optionalUrl,
	InstagramUrl: optionalUrl,
	TiktokUrl: optionalUrl,
})

type FormValues = z.infer<typeof formSchema>

interface Props {
	community: CommunityData
}

export function Content({ community }: Props) {
	const { toast } = useToast()
	const router = useRouter()

	const mutation = useMutation({
		mutationFn: async (body: FormValues) => {
			const reqBody = {
				CommunityId: community.Id,
				Description: body.Description,
				AffiliationType: body.AffiliationType,
			} as any

			if (body.WebsiteUrl) {
				reqBody.WebsiteUrl = body.WebsiteUrl
			}
			if (body.WhatsappUrl) {
				reqBody.WhatsappUrl = body.WhatsappUrl
			}
			if (body.InstagramUrl) {
				reqBody.InstagramUrl = body.InstagramUrl
			}
			if (body.TiktokUrl) {
				reqBody.TiktokUrl = body.TiktokUrl
			}

			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/communities', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(reqBody),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text()
				console.error(error);
				throw new Error(error)
			}
		},
		onSuccess: () => {
			router.push("/comunidades/" + community.Handle)
		},
		onError: (err) => {
			console.error(err)
			toast({
				title: "Erro ao editar comunidade",
				description: err.message,
				variant: "destructive",
			})
		}
	});

	// Initialize form
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			AffiliationType: community.AffiliationType,
			Description: community.Description,
			InstagramUrl: community.InstagramUrl,
			TiktokUrl: community.TiktokUrl,
			WebsiteUrl: community.WebsiteUrl,
			WhatsappUrl: community.WhatsappUrl,
		},
	})

	// Handle form submission
	const onSubmit = async (values: FormValues) => {
		mutation.mutate(values)
	}

	console.log(form.formState.errors);


	return (
		<>
			<Header title="Editar Comunidade" displayBackButton />

			<main className="flex-1 container mx-auto py-8 px-4 mb-16">
				<Card className="max-w-2xl mx-auto">
					<CardHeader>
						<CardTitle>Editar {community.Name}</CardTitle>
						<CardDescription>Edite os detalhes da sua comunidade.</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								{/* Community Description */}
								<FormField
									control={form.control}
									name="Description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Descrição</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Descreva sua comunidade e o que torna ela especial."
													className="min-h-[120px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Website Url */}
								<FormField
									control={form.control}
									name="WebsiteUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Site da comunidade</FormLabel>
											<FormControl>
												<Input placeholder="Ex: https://rolesejogos.com.br" {...field} value={field.value || undefined} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Whatsapp Url */}
								<FormField
									control={form.control}
									name="WhatsappUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>WhatsApp da comunidade</FormLabel>
											<FormControl>
												<Input placeholder="Ex: https://chat.whatsapp.com/rolesejogos" {...field} value={field.value || undefined} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Instagram Url */}
								<FormField
									control={form.control}
									name="InstagramUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Instagram da comunidade</FormLabel>
											<FormControl>
												<Input placeholder="Ex: https://www.instagram.com/rolesejogos" {...field} value={field.value || undefined} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Tiktok Url */}
								<FormField
									control={form.control}
									name="TiktokUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>TikTok da comunidade</FormLabel>
											<FormControl>
												<Input placeholder="Ex: https://tiktok.com/@rolesejogos" {...field} value={field.value || undefined} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="flex justify-end gap-4 pt-4">
									<Button type="button" variant="outline" asChild>
										<Link href={`/comunidades/${community.Handle}`}>Cancelar</Link>
									</Button>
									<Button type="submit" disabled={mutation.isPending} className="text-white">
										{mutation.isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Editando...
											</>
										) : (
											"Editar Comunidade"
										)}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</main>
		</>
	)
}