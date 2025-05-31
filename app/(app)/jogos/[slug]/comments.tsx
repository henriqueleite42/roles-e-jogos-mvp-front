// "use client"

// import { useToast } from "@/hooks/use-toast"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useState } from "react"
// import { useForm } from "react-hook-form"
// import { z } from "zod"

// type Comment = {
// 	id: string
// 	userId: string
// 	userName: string
// 	userAvatar?: string
// 	content: string
// 	rating?: number
// 	createdAt: string
// }

// // Comment form schema
// const commentFormSchema = z.object({
// 	content: z
// 		.string()
// 		.min(1, "O comentário não pode estar vazio")
// 		.max(500, "O comentário deve ter no máximo 500 caracteres"),
// 	rating: z.number().min(1).max(5).optional(),
// })

// type CommentFormValues = z.infer<typeof commentFormSchema>

// // Mock function to add a comment
// const addComment = async (gameId: string, content: string, rating?: number): Promise<Comment> => {
// 	// Simulate API delay
// 	await new Promise((resolve) => setTimeout(resolve, 800))

// 	return {
// 		id: `c${Date.now()}`,
// 		userId: "current-user",
// 		userName: "Você",
// 		userAvatar: "/placeholder.svg?height=32&width=32",
// 		content,
// 		rating,
// 		createdAt: new Date().toISOString(),
// 	}
// }

// export const GameComments = () => {
// 	const { toast } = useToast()

// 	const [isSubmittingComment, setIsSubmittingComment] = useState(false)

// 	const form = useForm<CommentFormValues>({
// 		resolver: zodResolver(commentFormSchema),
// 		defaultValues: {
// 			content: "",
// 			rating: undefined,
// 		},
// 	})

// 	const onSubmitComment = async (values: CommentFormValues) => {
// 		if (!game) return

// 		setIsSubmittingComment(true)
// 		try {
// 			const newComment = await addComment(game.id, values.content, selectedRating)
// 			setGame({
// 				...game,
// 				comments: [...game.comments, newComment],
// 			})
// 			form.reset()
// 			setSelectedRating(undefined)
// 			toast({
// 				title: "Comentário adicionado",
// 				description: "Seu comentário foi publicado com sucesso.",
// 			})
// 		} catch (error) {
// 			toast({
// 				title: "Erro ao adicionar comentário",
// 				description: "Não foi possível publicar seu comentário. Tente novamente.",
// 				variant: "destructive",
// 			})
// 		} finally {
// 			setIsSubmittingComment(false)
// 		}
// 	}

// 	return (
// 		<Card>
// 			<CardHeader>
// 				<CardTitle className="flex items-center gap-2">
// 					<MessageCircle className="h-5 w-5" />
// 					Comentários ({game.comments.length})
// 				</CardTitle>
// 			</CardHeader>
// 			<CardContent className="space-y-6">
// 				{/* Add Comment Form */}
// 				<Form {...form}>
// 					<form onSubmit={form.handleSubmit(onSubmitComment)} className="space-y-4">
// 						{/* Rating Selection */}
// 						<div>
// 							<label className="text-sm font-medium mb-2 block">Avaliação (opcional)</label>
// 							<div className="flex gap-1">
// 								{[1, 2, 3, 4, 5].map((rating) => (
// 									<button
// 										key={rating}
// 										type="button"
// 										onClick={() => setSelectedRating(selectedRating === rating ? undefined : rating)}
// 										className={cn(
// 											"p-1 rounded",
// 											selectedRating && rating <= selectedRating
// 												? "text-yellow-400"
// 												: "text-gray-300 hover:text-yellow-300",
// 										)}
// 									>
// 										<Star className="h-6 w-6 fill-current" />
// 									</button>
// 								))}
// 							</div>
// 						</div>

// 						<FormField
// 							control={form.control}
// 							name="content"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormControl>
// 										<Textarea
// 											placeholder="Compartilhe sua opinião sobre este jogo..."
// 											className="min-h-[100px]"
// 											disabled={isSubmittingComment}
// 											{...field}
// 										/>
// 									</FormControl>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>
// 						<div className="flex justify-end">
// 							<Button type="submit" disabled={isSubmittingComment} className="gap-2">
// 								{isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
// 								{isSubmittingComment ? "Publicando..." : "Publicar Comentário"}
// 							</Button>
// 						</div>
// 					</form>
// 				</Form>

// 				{/* Comments List */}
// 				<div className="space-y-4">
// 					{game.comments.length > 0 ? (
// 						game.comments.map((comment) => (
// 							<div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
// 								<Avatar className="w-10 h-10 flex-shrink-0">
// 									<AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
// 									<AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
// 								</Avatar>
// 								<div className="flex-1">
// 									<div className="flex items-center gap-2 mb-1">
// 										<span className="font-medium">{comment.userName}</span>
// 										{comment.rating && (
// 											<div className="flex items-center gap-1">
// 												{[...Array(5)].map((_, i) => (
// 													<Star
// 														key={i}
// 														className={cn(
// 															"h-3 w-3",
// 															i < comment.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
// 														)}
// 													/>
// 												))}
// 											</div>
// 										)}
// 										<span className="text-xs text-muted-foreground">{formatCommentDate(comment.createdAt)}</span>
// 									</div>
// 									<p className="text-sm">{comment.content}</p>
// 								</div>
// 							</div>
// 						))
// 					) : (
// 						<div className="text-center py-8">
// 							<MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
// 							<p className="text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
// 						</div>
// 					)}
// 				</div>
// 			</CardContent>
// 		</Card>
// 	)
// }