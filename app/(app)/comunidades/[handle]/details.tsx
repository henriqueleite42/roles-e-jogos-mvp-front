"use client"

import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CommunityData, CommunityMemberData, Profile } from "@/types/api";
import { AvatarComponent } from "./avatar";
import { Button } from "@/components/ui/button";
import { ArrowRightFromLine, MapPin, Share2 } from "lucide-react";
import { Handle } from "./handle";
import { Name } from "./name";
import { getDescription } from "@/lib/description";
import { useMutation } from "@tanstack/react-query";

interface Props {
	member?: CommunityMemberData
	community: CommunityData
}

export function CommunityDetails({ community, member }: Props) {
	const { toast } = useToast()

	const shareProfile = async () => {
		const shareData = {
			title: community.Name,
			text: getDescription(community.Description),
			url: window.location.href,
		}

		try {
			if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
				await navigator.share(shareData)
			} else {
				await navigator.clipboard.writeText(window.location.href)
				toast({
					title: "Link copiado",
					description: "O link do perfil foi copiado para a área de transferência.",
				})
			}
		} catch (error) {
			if ((error as any).name !== "AbortError") {
				toast({
					title: "Erro ao compartilhar",
					description: "Não foi possível compartilhar a comunidade.",
					variant: "destructive",
				})
			}
		}
	}

	const mutation = useMutation({
		mutationFn: async () => {
			const responseJoinCommunity = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/join`, {
				method: "POST",
				body: JSON.stringify({
					CommunityId: community.Id,
				}),
				headers: { 'Content-Type': 'application/json' },
				credentials: "include"
			})

			if (!responseJoinCommunity.ok) {
				console.error(await responseJoinCommunity.text())
				throw new Error(`Fail to join community ${responseJoinCommunity.status}`)
			}
		},
		onSuccess: () => {
			window.location.reload()
		},
		onError: (error) => {
			console.error('Error uploading or updating profile img:', error)
			toast({
				title: "Erro ao entrar na comunidade",
				description: error.message,
				variant: "destructive",
			})
		},
	})

	const joinCommunity = () => {
		mutation.mutate()
	}

	return (
		<>
			<Card className="mb-6">
				<CardContent className="p-6">
					<div className="flex flex-col sm:flex-row gap-6">
						<div className="flex flex-col items-center sm:items-start">
							<AvatarComponent community={community} member={member} />
						</div>

						<div className="flex-1">
							<Name community={community} member={member} />
							<Handle community={community} member={member} />
							<div className="flex gap-2 items-center">
								<MapPin className="h-4 w-4" />
								<p>{community.Location.City}, {community.Location.State}</p>
							</div>
							<p className="text-lg mb-4 whitespace-pre-line overflow-hidden text-ellipsis break-words">{community.Description}</p>

							{/* {profile.location && (
							<div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
								<MapPin className="h-4 w-4" />
								<span>{profile.location}</span>
							</div>
						)} */}
							{/* {profile.bio && <p className="text-muted-foreground mb-4">{profile.bio}</p>} */}

							{/* Quick Stats */}
							{/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							<div className="text-center">
								<div className="text-xl font-bold text-orange-600">{profile.stats.totalGames}</div>
								<div className="text-xs text-muted-foreground">Jogos</div>
							</div>
							<div className="text-center">
								<div className="text-xl font-bold text-purple-600">{profile.stats.totalEvents}</div>
								<div className="text-xs text-muted-foreground">Eventos</div>
							</div>
							<div className="text-center">
								<div className="text-xl font-bold text-green-600">{earnedBadges.length}</div>
								<div className="text-xs text-muted-foreground">Conquistas</div>
							</div>
							<div className="text-center">
								<div className="text-xl font-bold text-blue-600">{profile.stats.totalPlayTime}</div>
								<div className="text-xs text-muted-foreground">Tempo jogado</div>
							</div>
						</div> */}
							<div className="flex justify-end">
								<Button className="text-white" onClick={shareProfile}>
									<Share2 className="h-4 w-4" />
									Compartilhar
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{
				!member && (
					<Card className="mb-6">
						<CardContent className="p-6">
							<Button className="text-white w-full" onClick={joinCommunity}>
								<ArrowRightFromLine className="h-4 w-4" />
								Entrar na comunidade
							</Button>
						</CardContent>
					</Card>
				)
			}
		</>
	)
}