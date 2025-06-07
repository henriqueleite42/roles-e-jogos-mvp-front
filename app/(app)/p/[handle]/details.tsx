"use client"

import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/api";
import { AvatarComponent } from "./avatar";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { Handle } from "./handle";
import { Name } from "./name";

interface Props {
	auth?: Profile
	profile: Profile
}

export function ProfileDetails({ profile, auth }: Props) {
	const { toast } = useToast()

	const shareProfile = async () => {
		const shareData = {
			title: profile.Handle,
			text: `Confira o perfil de ${profile.Name} no Rolês & Jogos`,
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
					description: "Não foi possível compartilhar o perfil.",
					variant: "destructive",
				})
			}
		}
	}

	return (
		<Card className="mb-6">
			<CardContent className="p-6">
				<div className="flex flex-col sm:flex-row gap-6">
					<div className="flex flex-col items-center sm:items-start">
						<AvatarComponent profile={profile} auth={auth} />
					</div>

					<div className="flex-1">
						<Name profile={profile} auth={auth} />
						<Handle profile={profile} auth={auth} />
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
	)
}