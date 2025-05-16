import Link from "next/link"
import Image from "next/image"
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Users, Calendar, ChevronRight, Puzzle, VenetianMask, Dice5 } from "lucide-react"

import EVENTS from "../../get-data/events.json"
import { cookies } from "next/headers"
const now = new Date().getTime()
const events = EVENTS.filter(e => new Date(e.Date).getTime() >= now).splice(0, 3)

function formatEventDate(dateString: string): string {
	const date = new Date(dateString)

	// Format date: DD/MM/YYYY
	const day = date.getDate().toString().padStart(2, "0")
	const month = (date.getMonth() + 1).toString().padStart(2, "0")
	const year = date.getFullYear()

	// Format time: HH:MM
	const hours = date.getHours().toString().padStart(2, "0")
	const minutes = date.getMinutes().toString().padStart(2, "0")

	return `${day}/${month}/${year} às ${hours}:${minutes}`
}

export default async function LandingPage() {
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/jogos")
	}

	return (
		<div className="flex min-h-screen flex-col">
			<header className="p-4 border-b bg-gradient-to-r from-primary to-primary-foreground">
				<h1 className="text-2xl font-bold text-center text-white">Rolês & Jogos</h1>
			</header>

			<main className="flex-1">
				<section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-red-50 to-background">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
							<div className="flex flex-col justify-center space-y-4">
								<div className="space-y-2">
									<p className="max-w-[600px] text-gray-500 md:text-xl">
										Um grupo de amigos que se reune pra jogar jogos de tabuleiro!
									</p>
								</div>
								<div className="flex flex-col gap-2 min-[400px]:flex-row">
									<Link href="https://chat.whatsapp.com/DBjhCiDQst79Kmpbk9JJmE">
										<Button className="bg-primary hover:bg-primary-foreground">
											Faça parte de nossa comunidade
											<ChevronRight className="ml-2 h-4 w-4" />
										</Button>
									</Link>
								</div>
								<div className="text-sm text-gray-500 mt-4">
									<p className="font-medium text-lg">Todos são bem vindos, vem jogar com a gente!</p>
								</div>
							</div>
							<Image
								src="/nosso-grupo.jpg?height=400&width=400"
								width={500}
								height={400}
								alt="Pessoas jogando jogos de tabuleiro"
								className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
							/>
						</div>
					</div>
				</section>

				<section id="jogos" className="w-full py-12 md:py-24 lg:py-32 bg-white">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<div className="inline-block rounded-lg bg-red-700 px-3 py-1 text-sm text-red-50">
									Nossa Coleção
								</div>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Jogos da Comunidade</h2>
								<p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Conheça alguns dos jogos que costumamos jogar em nossos encontros.
								</p>
							</div>
						</div>
						<div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
							<div
								className="flex flex-col items-center space-y-4 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
							>
								<div className="p-2 rounded-full bg-red-50">
									<VenetianMask className="h-10 w-10 text-primary" />
								</div>
								<h3 className="text-xl font-bold">Bandido</h3>
								<p className="text-sm text-gray-500 text-center">
									Perfeito para a familia! Guardas que tentam impedir um bandido de escapar pelos tuneis sem se comunicarem.
								</p>
							</div>
							<div
								className="flex flex-col items-center space-y-4 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
							>
								<div className="p-2 rounded-full bg-red-50">
									<Dice5 className="h-10 w-10 text-primary" />
								</div>
								<h3 className="text-xl font-bold">Catan</h3>
								<p className="text-sm text-gray-500 text-center">
									Um jogo caotico e competivo, super divertido quando você quer passar raiva na esportiva!
								</p>
							</div>
							<div
								className="flex flex-col items-center space-y-4 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
							>
								<div className="p-2 rounded-full bg-red-50">
									<Puzzle className="h-10 w-10 text-primary" />
								</div>
								<h3 className="text-xl font-bold">Death May Die</h3>
								<p className="text-sm text-gray-500 text-center">
									Juntem suas forças nesse jogo cooperativo para enfrentar o maligno Cthulhu!
								</p>
							</div>
						</div>
						<div className="flex justify-center">
							<Link href="/jogos">
								<Button variant="outline" className="border-primary text-primary hover:bg-red-50 hover:text-primary">
									Ver todos os jogos
									<ChevronRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</div>
					</div>
				</section>

				<section className="w-full py-12 md:py-24 lg:py-32 bg-red-50">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<div className="inline-block rounded-lg bg-red-700 px-3 py-1 text-sm text-red-50">
									Próximos Eventos
								</div>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Mesas Marcadas</h2>
								<p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Confira as próximas mesas e participe dos nossos encontros.
								</p>
							</div>
						</div>
						<div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
							{events.map((event) => (
								<div key={event.Id} className="flex flex-col space-y-3 rounded-lg border bg-white p-6 shadow-sm">
									<div className="flex items-center space-x-3">
										<Calendar className="h-5 w-5 text-primary" />
										<h3 className="text-xl font-bold">{event.Name}</h3>
									</div>
									<p className="text-sm text-gray-500">Data: {formatEventDate(event.Date)}</p>
									<p className="text-sm text-gray-500">Local: {event.Location.Name}</p>
									<p className="text-sm text-gray-500">Jogos previstos: {event.Games.map(g => g.Name).join(", ")}</p>
									{/* <Button className="mt-2 bg-primary hover:bg-red-600">Confirmar presença</Button> */}
								</div>
							))}
						</div>
						<div className="flex justify-center">
							<Link href="/eventos">
								<Button variant="outline" className="border-primary text-primary hover:bg-red-50 hover:text-primary">
									Veja as próximas mesas marcadas
									<ChevronRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</div>
					</div>
				</section>

				<section className="w-full py-12 md:py-24 lg:py-32 bg-white">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
							<Image
								src="/nosso-grupo1.jpg?height=300&width=300"
								width={300}
								height={300}
								alt="Comunidade de jogadores"
								className="mx-auto overflow-hidden rounded-xl object-cover object-center sm:w-full"
							/>
							<div className="flex flex-col justify-center space-y-4">
								<div className="space-y-2">
									<div className="inline-block rounded-lg bg-red-700 px-3 py-1 text-sm text-red-50">
										Nossa Comunidade
									</div>
									<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Sobre Nós</h2>
									<p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
										Somos um grupo de amigos apaixonados por jogos de tabuleiro que se reúne regularmente para
										compartilhar momentos divertidos.
									</p>
									<p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
										<strong>Todos são bem vindos, vem jogar com a gente!</strong> Não importa se você é iniciante ou
										experiente, o importante é se divertir.
									</p>
								</div>
								<div className="flex items-center space-x-4">
									<Users className="h-12 w-12 text-primary" />
									<div>
										<h3 className="text-xl font-bold">+35 Membros</h3>
										<p className="text-sm text-gray-500">Faça parte da nossa comunidade</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-white">
					<div className="container px-4 md:px-6 text-center">
						<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">Vem jogar com a gente!</h2>
						<p className="mx-auto max-w-[700px] text-red-50 md:text-xl/relaxed mb-8">
							Todos são bem vindos na nossa comunidade. Junte-se a nós para momentos de diversão e novas amizades.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link href="https://chat.whatsapp.com/DBjhCiDQst79Kmpbk9JJmE">
								<Button className="bg-white text-primary hover:bg-red-50">
									Vem jogar com a gente!
								</Button>
							</Link>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t bg-background">
				<div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
					<div className="flex flex-col gap-2 md:gap-4 md:flex-1">
						<div className="flex items-center gap-2">
							<Dice5 className="h-6 w-6 text-primary" />
							<span className="text-lg font-bold">Rolês & Jogos</span>
						</div>
						<p className="text-sm text-gray-500">Um grupo de amigos que se reune pra jogar jogos de tabuleiro!</p>
					</div>
					<div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:flex-1">
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Links</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<Link href="/home" className="transition-colors hover:text-primary">
										Início
									</Link>
								</li>
								<li>
									<Link href="/jogos" className="transition-colors hover:text-primary">
										Jogos
									</Link>
								</li>
								<li>
									<Link href="/eventos" className="transition-colors hover:text-primary">
										Mesas
									</Link>
								</li>
							</ul>
						</div>
						{/* <div className="space-y-2">
							<h4 className="text-sm font-medium">Comunidade</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<Link href="#" className="transition-colors hover:text-primary">
										Sobre
									</Link>
								</li>
								<li>
									<Link href="#" className="transition-colors hover:text-primary">
										Membros
									</Link>
								</li>
								<li>
									<Link href="#" className="transition-colors hover:text-primary">
										Contato
									</Link>
								</li>
							</ul>
						</div> */}
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Redes Sociais</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<Link href="https://www.instagram.com/rolesejogos/" className="transition-colors hover:text-primary">
										Instagram
									</Link>
								</li>
								<li>
									<Link href="https://chat.whatsapp.com/DBjhCiDQst79Kmpbk9JJmE" className="transition-colors hover:text-primary">
										WhatsApp
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div className="border-t py-6 md:py-8">
					<div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
						<p className="text-center text-sm text-gray-500 md:text-left">
							© {new Date().getFullYear()} Rolês & Jogos. Todos os direitos reservados.
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
