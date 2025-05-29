import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Partners } from "@/components/partners"

// Team member type
type TeamMember = {
	id: number
	name: string
	role: string
	bio: string
	imageUrl: string
	socialLinks?: {
		linkedin?: string
		twitter?: string
		github?: string
		email?: string
	}
}

// Mock team data
const teamMembers: TeamMember[] = [
	{
		id: 1,
		name: "Henrique Leite",
		role: "Fundador & Programador",
		bio: "Programador e jogador ávido, Henrique fundou a Rolês & Jogos para conectar entusiastas e criar uma comunidade vibrante.",
		imageUrl: "/henrique.png",
	},
	{
		id: 2,
		name: "Giovanna Veiga",
		role: "Monitora & Social Media",
		bio: "Criativa e antenada, Giovanna cuida das redes sociais da Rolês & Jogos, dando voz à comunidade e espalhando a paixão pelos jogos de forma leve e envolvente.",
		imageUrl: "/giovanna.jpeg",
	},
	{
		id: 3,
		name: "Denys Moraes",
		role: "Gerente de Relações",
		bio: "Comunicativo e carismático, Denys fortalece os laços da Rolês & Jogos ao liderar parcerias e conectar pessoas que compartilham a paixão pelos jogos de mesa.",
		imageUrl: "/denys.jpg",
	}
]

export default function AboutUsPage() {
	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
			<Header title="Sobre Nós" displayBackButton />

			<main className="flex-1 container mx-auto py-8 px-4">
				<div className="max-w-4xl mx-auto space-y-16">
					{/* Hero Section */}
					<section className="text-center">
						<h1 className="text-4xl font-bold mb-4">Rolês & Jogos</h1>
						<p className="text-xl text-muted-foreground">
							Conectando jogadores e criando experiências memoráveis
						</p>
						{/* <div className="flex justify-center gap-4">
							<Badge variant="outline" className="px-4 py-2 text-base flex items-center gap-2">
								<MapPin className="h-4 w-4" /> 15+ cidades
							</Badge>
							<Badge variant="outline" className="px-4 py-2 text-base flex items-center gap-2">
								<Calendar className="h-4 w-4" /> 200+ eventos
							</Badge>
						</div> */}
					</section>

					{/* History Section */}
					<section>
						<h2 className="text-3xl font-bold mb-6 text-center">Nossa História</h2>
						<div className="space-y-6">
							<div className="bg-white rounded-lg p-6 shadow-sm border">
								<h3 className="text-xl font-semibold mb-4">Como tudo começou</h3>
								<p className="mb-4">
									A Rolês & Jogos nasceu em 2025 da paixão de um grupo de amigos por jogos de tabuleiro e da dificuldade
									em encontrar pessoas para jogar. O que começou como um simples grupo de WhatsApp para organizar
									encontros em Campinas rapidamente cresceu para uma comunidade vibrante.
								</p>
								<p>
									Nossa missão é simples: facilitar o encontro entre pessoas que compartilham a paixão por jogos de
									tabuleiro, criando experiências memoráveis e fortalecendo a comunidade de jogadores em todo a região.
								</p>
							</div>
						</div>
					</section>

					{/* Team Section */}
					<section>
						<h2 className="text-3xl font-bold mb-6 text-center">Nossa Equipe</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{teamMembers.map((member) => (
								<Card key={member.id} className="overflow-hidden hover:shadow-md transition-all">
									<div className="aspect-square relative">
										<Image
											src={member.imageUrl || "/placeholder.svg"}
											alt={member.name}
											fill
											className="object-cover"
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
										/>
									</div>
									<CardContent className="p-4">
										<h3 className="font-bold text-lg">{member.name}</h3>
										<p className="text-orange-600 font-medium text-sm mb-2">{member.role}</p>
										<p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Partnerships Section */}
					<Partners />

					{/* Contact Section */}
					<section className="text-center">
						<h2 className="text-3xl font-bold mb-6">Entre em Contato</h2>
						<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
							Tem alguma dúvida, sugestão ou quer se tornar um parceiro? Entre em contato conosco e teremos prazer em
							conversar!
						</p>
						<Link href="/whatsapp">
							<Button size="lg" className="text-white">
								Entre pra comunidade
							</Button>
						</Link>
					</section>
				</div>
			</main>
		</div>
	)
}
