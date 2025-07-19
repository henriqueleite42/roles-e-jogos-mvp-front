"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { connectionsIcons } from "@/lib/icons"
import { toPascalCase } from "@/lib/string"
import { availableProviders } from "../p/[handle]/connections"

export default function SignInPage() {
	const [isLoading, setIsLoading] = useState<string | null>(null)

	return (
		<>
			<Header title="Cria sua conta" displayBackButton />

			<div className="flex flex-col min-h-screen bg-gradient-to-b from-red-50 to-white" >
				<main className="flex-1 flex flex-col items-center justify-center p-4" >
					<Card className="w-full max-w-md" >
						<CardHeader className="text-center" >
							<CardTitle className="text-2xl" > Bem-vindo(a)! </CardTitle>
							< CardDescription > Entre ou cadastre-se para acessar seus jogos e eventos.</CardDescription>
						</CardHeader>
						< CardContent className="space-y-4" >
							{
								availableProviders.filter(p => p.UrlCreate).map((provider) => (
									<a key={provider.Provider} href={provider.UrlCreate!} className="grid" rel="noopener noreferrer">
										<Button
											className={`w-full justify-start gap-3 h-14 text-white ${connectionsIcons[provider.Provider as keyof typeof connectionsIcons].color}`}
											disabled={isLoading !== null}
										>
											{isLoading === provider.Provider ? (
												<Loader2 className="h-5 w-5 animate-spin mr-2" />
											) : connectionsIcons[provider.Provider as keyof typeof connectionsIcons].icon({
												className: "h-5 w-5 text-white"
											})}
											<span>Continuar com {toPascalCase(provider.Provider)}</span>
										</Button>
									</a>
								))}
						</CardContent>
						< CardFooter className="flex flex-col space-y-4" >
							<div className="text-center text-sm text-muted-foreground" >
								Ao continuar, você concorda com nossos{" "}
								<Link href="/termos-de-uso" className="underline underline-offset-4 hover:text-primary" >
									Termos de Serviço
								</Link>{" "}
								e{" "}
								<Link href="/politica-de-privacidade" className="underline underline-offset-4 hover:text-primary" >
									Política de Privacidade
								</Link>
								.
							</div>
						</CardFooter>
					</Card>

					<div className="py-6 text-center text-sm text-muted-foreground" >
						<p>Não tem uma conta?<br />Escolha um dos provedores acima para se cadastrar.</p>
					</div>
				</main>
			</div>
		</>
	)
}
