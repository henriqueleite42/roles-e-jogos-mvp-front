"use client"

import { Badge } from "@/components/ui/badge"
import { CommunityData, CommunityMemberData } from "@/types/api"
import { AvatarComponent } from "./avatar"
import { Globe, MapPin, Share2, UserPlus } from "lucide-react"
import { InstagramIcon } from "@/components/icons/instagram"
import { WhatsAppIcon } from "@/components/icons/whatsapp"
import { TikTokIcon } from "@/components/icons/tiktok"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { getDescription } from "@/lib/description"
import { useToast } from "@/hooks/use-toast"
import { Handle } from "./handle"
import { Name } from "./name"

interface Props {
	member?: CommunityMemberData
	community: CommunityData
}

const getAffiliationBadge = (type: string) => {
	switch (type) {
		case "PUBLIC":
			return (
				<Badge variant="secondary" className="bg-green-100 text-green-800">
					Pública
				</Badge>
			)
		case "INVITE_ONLY":
			return (
				<Badge variant="secondary" className="bg-purple-100 text-purple-800">
					Apenas Convite
				</Badge>
			)
		default:
			return <Badge variant="secondary">Desconhecido</Badge>
	}
}


export function Details({ community, member }: Props) {
	const { toast } = useToast()

	const handleShareCommunity = async () => {
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

	const handleJoinCommunity = () => {
		mutation.mutate()
	}

	return (
		<div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
			<div className="flex flex-col md:flex-row gap-6">
				<AvatarComponent community={community} member={member} />

				<div className="flex-1">
					<div className="flex items-center gap-2">
						<Name community={community} member={member} />
						{getAffiliationBadge(community.AffiliationType)}
					</div>

					<Handle community={community} member={member} />

					{community.Location && (
						<div className="flex items-center gap-1 text-gray-500">
							<MapPin className="w-4 h-4" />
							<span>{community.Location.City}, {community.Location.State}</span>
						</div>
					)}

					<p className="text-gray-700 text-lg mb-4 whitespace-pre-line overflow-hidden text-ellipsis break-words">
						{community.Description}
					</p>

					{/* Social Media Links */}
					<div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
						{community.InstagramUrl && (
							<a
								href={community.InstagramUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
							>
								<InstagramIcon className="w-4 h-4" />
							</a>
						)}

						{community.WhatsappUrl && (
							<a
								href={community.WhatsappUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
							>
								<WhatsAppIcon className="w-4 h-4" />
							</a>
						)}

						{community.TiktokUrl && (
							<a
								href={community.TiktokUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
							>
								<TikTokIcon className="w-4 h-4" />
							</a>
						)}

						{community.WebsiteUrl && (
							<a
								href={community.WebsiteUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
							>
								<Globe className="w-4 h-4" />
							</a>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap justify-center md:justify-start gap-3">
						{!member && (
							<Button onClick={handleJoinCommunity} className="text-white w-full">
								<UserPlus className="w-4 h-4 mr-2" />
								Entrar na Comunidade
							</Button>
						)}

						<Button variant={member ? undefined : "outline"}
							onClick={handleShareCommunity} className={member ? "text-white w-full" : "w-full"}>
							<Share2 className="w-4 h-4 mr-2" />
							Compartilhar
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}