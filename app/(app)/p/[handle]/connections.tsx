"use client"

import { AlertCircle, Calendar, ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Connection, Profile, ResponseListConnections } from "@/types/api"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { connectionsIcons } from "@/lib/icons"
import { toPascalCase } from "@/lib/string"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Logout } from "./logout"

interface Props {
	auth?: Profile
	profile: Profile
}

const availableProviders = [
	{
		Provider: "GOOGLE",
		Url: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!
	},
	{
		Provider: "LUDOPEDIA",
		Url: process.env.NEXT_PUBLIC_LUDOPEDIA_REDIRECT_URI!
	},
]

export function TipLinkLudopedia() {
	return (
		<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
			<h4 className="font-medium text-blue-900 mb-2">💡 Dica:</h4>
			Conecte sua conta da Ludopedia para importar sua coleção de jogos!
			<Link href={availableProviders[1].Url} className="grid mt-3">
				<Button
					variant="outline"
					className={`justify-start gap-3 h-14 ${connectionsIcons[availableProviders[1].Provider as keyof typeof connectionsIcons].color}`}
				>
					<div className={` p-2 rounded-full`}>
						{connectionsIcons[availableProviders[1].Provider as keyof typeof connectionsIcons].icon({
							className: "h-5 w-5"
						})}
					</div>
					<span>Conectar com {toPascalCase(availableProviders[1].Provider)}</span>
				</Button>
			</Link>
		</div>
	)
}

export function Connections({ profile }: Props) {
	const { toast } = useToast()
	const queryClient = useQueryClient()

	const [expandedConnection, setExpandedConnection] = useState<Connection | undefined>(undefined)

	const { data: connections, isPending } = useQuery<ResponseListConnections>({
		queryKey: ["connections", profile.AccountId],
		staleTime: 0,   // Always refetch, never consider the data fresh
		queryFn: async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/me`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Get connection import status failed with status ${response.status}`)
			}

			return response.json()
		},
	})

	const {
		mutate: requestImportCollectionFromLudopedia,
		status, error
	} = useMutation({
		mutationFn: async (externalId: string) => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/import/ludopedia`, {
				method: "PUT",
				body: JSON.stringify({
					ExternalId: externalId
				}),
				headers: { 'Content-Type': 'application/json' },
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Get connection import status failed with status ${response.status}`)
			}
		},
		onSuccess: () => {
			toast({
				title: "jogos importados com sucesso!"
			})
		},
		onError: (error) => {
			console.error('Error requesting import collection:', error)
		},
	})

	const toggleConnection = (connection: Connection) => {
		if (connection.Provider !== "LUDOPEDIA") return

		setExpandedConnection((curValue) => curValue?.ExternalId === connection?.ExternalId ? undefined : connection)
	}

	const getImportStatusBadge = () => {
		if (status === "error") {
			return (
				<Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50">
					Erro: {error.message}
				</Badge>
			)
		}
		if (status === "pending") {
			return (
				<Badge variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50">
					Em progresso
				</Badge>
			)
		}

		return (
			<Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
				Sucesso
			</Badge>
		)
	}

	return (
		<>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between gap-2">
						<div className="flex gap-2">
							<Calendar className="h-5 w-5" />
							Conexões
						</div>
						<Sheet>
							<SheetTrigger asChild>
								<Button size="sm" className="gap-1 text-white">
									<Plus className="h-4 w-4" /> Adicionar
								</Button>
							</SheetTrigger>
							<SheetContent side="bottom" className="h-[400px]">
								<SheetHeader className="text-left">
									<SheetTitle>Adicionar conexão</SheetTitle>
									<SheetDescription>Conecte sua conta a outros serviços para facilitar o login e integrações.</SheetDescription>
								</SheetHeader>
								<div className="grid gap-4 py-4">
									{
										availableProviders.map(p => (
											<Link key={p.Provider} href={p.Url || ""} className="grid">
												<Button
													variant="outline"
													className="justify-start gap-3 h-14"
												>
													<div className={`${connectionsIcons[p.Provider as keyof typeof connectionsIcons].color} p-2 rounded-full`}>
														{connectionsIcons[p.Provider as keyof typeof connectionsIcons].icon({
															className: "h-5 w-5 text-white"
														})}
													</div>
													<span>Conectar com {toPascalCase(p.Provider)}</span>
												</Button>
											</Link>
										))
									}
								</div>
							</SheetContent>
						</Sheet>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{!isPending && !(connections?.Data || []).find(c => c.Provider === "LUDOPEDIA") && (
						<TipLinkLudopedia />
					)}
					{isPending && (
						<div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[100vh]">
							<Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
							<p className="text-lg text-muted-foreground">Carregando conexões...</p>
						</div>
					)}
					{error && (
						<div className="container mx-auto py-8 px-4">
							<Alert variant="destructive" className="mb-6">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Erro ao carregar conexões: {error.message}. Por favor, tente novamente mais tarde.
								</AlertDescription>
							</Alert>
							<Button onClick={() => window.location.reload()}>Tentar novamente</Button>
						</div>
					)}
					{(connections?.Data || []).length === 0 && (
						<p className="text-gray-600 text-center italic">Nenhuma conexão</p>
					)}
					{(connections?.Data || []).map((connection) => (
						<div key={connection.Provider + connection.ExternalId} className="border rounded-lg overflow-hidden">
							{/* Connection header - always visible */}
							<div
								className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50"
								onClick={() => toggleConnection(connection)}
							>
								<div className="flex items-center gap-3">
									<div className={`p-2 rounded-full text-white ${connectionsIcons[connection.Provider as keyof typeof connectionsIcons].color}`}>
										{connectionsIcons[connection.Provider as keyof typeof connectionsIcons].icon({
											className: "h-5 w-5 text-white"
										})}
									</div>
									<div>
										<p className="font-medium">{toPascalCase(connection.Provider)}</p>
										<p className="text-xs">Conta: {connection.ExternalHandle || connection.ExternalId}</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
										Conectado
									</Badge>
									{(
										connection.Provider === "LUDOPEDIA" ? (
											<>
												{expandedConnection?.ExternalId === connection.ExternalId ? (
													<ChevronUp className="h-5 w-5 text-gray-400" />
												) : (
													<ChevronDown className="h-5 w-5 text-gray-400" />
												)}
											</>
										) : (
											<div className="h-5 w-5" />
										)
									)}
								</div>
							</div>

							{/* Collapsible content */}
							{connection.Provider == "LUDOPEDIA" && expandedConnection?.ExternalId === connection.ExternalId && (
								<div className="p-3 border-t bg-gray-50 space-y-3">
									<div className="flex sm:flex-row sm:items-center justify-between gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => requestImportCollectionFromLudopedia(connection.ExternalId)}
											disabled={status == "pending"}
										>
											{status == "pending" ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Importando...
												</>
											) : (
												"Importar coleção"
											)}
										</Button>
										{getImportStatusBadge()}
									</div>

									{/* <Button
											variant="outline"
											size="sm"
											className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
											onClick={() => window.alert("Essa feature ainda não está disponivel. Para Desconectar sua conta, por favor entre em contato com os administradores.")}
										>
											Desconectar
										</Button> */}
								</div>
							)}
						</div>
					))}
				</CardContent>
			</Card>

			<Logout />
		</>
	)
}