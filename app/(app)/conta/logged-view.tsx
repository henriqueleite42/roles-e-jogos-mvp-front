
import { Card, CardContent } from "@/components/ui/card"
import { Connections, TipLinkLudopedia } from "./connections"
import { Username } from "./username"
import { AvatarComponent } from "./avatar"
import { Profile } from "@/types/api"
import { Logout } from "./logout"
import { Header } from "@/components/header"

interface Props {
	profile: Profile
}

export function LoggedView({ profile }: Props) {
	return (
		<>
			<Header title="Conta" displayBackButton />

			<div className="flex flex-col min-h-screen bg-gradient-to-b from-red-50 to-white">
				<main className="flex-1 p-4 max-w-md mx-auto w-full">
					<section className="mb-8">
						<Card className="overflow-hidden">
							<div className="bg-gradient-to-r from-primary to-primary-foreground h-24 relative"></div>

							<CardContent className="pt-0 relative -mt-12">
								<AvatarComponent username={profile.Handle} profileImageUrl={profile.AvatarUrl} />

								<Username username={profile.Handle} />

								{/* <Badge variant="outline" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
								Jogador
							</Badge> */}
							</CardContent>
						</Card>
					</section>

					{
						!profile.Connections.find(c => c.Provider === "LUDOPEDIA") && (
							<TipLinkLudopedia />
						)
					}

					<Connections connections={profile.Connections} />

					<Logout />
				</main>

			</div >
		</>
	)
}