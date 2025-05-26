// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
// import { Textarea } from "@/components/ui/textarea";
// import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
// import { MessageCircle, Loader2, Send } from "lucide-react";
// import { Button } from "react-day-picker";
// import { Form } from "react-hook-form";

// export function CommentsSection() {
// 	return (
// 		<Card>
// 			<CardHeader>
// 				<CardTitle className="flex items-center gap-2">
// 					<MessageCircle className="h-5 w-5" />
// 					Comentários ({event.comments.length})
// 				</CardTitle>
// 			</CardHeader>
// 			<CardContent className="space-y-6">
// 				{/* Add Comment Form */}
// 				<Form {...form}>
// 					<form onSubmit={form.handleSubmit(onSubmitComment)} className="space-y-4">
// 						<FormField
// 							control={form.control}
// 							name="content"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormControl>
// 										<Textarea
// 											placeholder="Adicione um comentário sobre o evento..."
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
// 								{isSubmittingComment ? (
// 									<Loader2 className="h-4 w-4 animate-spin" />
// 								) : (
// 									<Send className="h-4 w-4" />
// 								)}
// 								{isSubmittingComment ? "Publicando..." : "Publicar Comentário"}
// 							</Button>
// 						</div>
// 					</form>
// 				</Form>

// 				{/* Comments List */}
// 				<div className="space-y-4">
// 					{event.comments.length > 0 ? (
// 						event.comments.map((comment) => (
// 							<div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
// 								<Avatar className="w-10 h-10 flex-shrink-0">
// 									<AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
// 									<AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
// 								</Avatar>
// 								<div className="flex-1">
// 									<div className="flex items-center gap-2 mb-1">
// 										<span className="font-medium">{comment.userName}</span>
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