import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, ChevronRight, Puzzle, VenetianMask, Dice5 } from "lucide-react"
import { Header } from "@/components/header";
import { Events } from "./events";

export default async function LandingPage() {
	return (
		<>
			<Header />

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
									<Link href="/home">
										<Button className="bg-primary hover:bg-primary-foreground text-white">
											Explore nossa comunidade
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
						<Events />
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
										<h3 className="text-xl font-bold">40+ Membros</h3>
										<p className="text-sm text-gray-500">Comunidade que cresce a cada dia</p>
									</div>
								</div>

								<div className="flex flex-col justify-center gap-2 min-[400px]:flex-row">
									<Link href="/sobre-nos">
										<Button className="bg-primary hover:bg-primary-foreground text-white">
											Conheça mais sobre nós
											<ChevronRight className="ml-2 h-4 w-4" />
										</Button>
									</Link>
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
							<Link href="/whatsapp">
								<Button className="bg-white text-primary hover:bg-red-50">
									Faça parte de nossa comunidade
								</Button>
							</Link>
						</div>
					</div>
				</section>
			</main>
		</>
	)
}
