"use client"

import { ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Connection } from "@/types/api"
import { connectionsIcons, toPascalCase } from "./utils"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface Props {
	connections: Array<Connection>
}

interface ConnectionImportStatus {
	Status: "COMPLETED" | "FAILED" | "STARTED" | "NOT_YET_IMPORTED"
	LastImportDate?: Date
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

function formatEventDate(dateString: string | Date): string {
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

export function Connections({ connections }: Props) {
	const queryClient = useQueryClient()

	const [expandedConnection, setExpandedConnection] = useState<Connection | undefined>(undefined)

	const {
		data: importStatus,
		isLoading: isGettingImportStatus,
	} = useQuery<ConnectionImportStatus>({
		queryKey: ["connectionImportStatus", expandedConnection],
		staleTime: 0,   // Always refetch, never consider the data fresh
		queryFn: async () => {
			if (!expandedConnection) return {} as ConnectionImportStatus

			const query = new URLSearchParams({
				externalId: expandedConnection.ExternalId,
				provider: expandedConnection.Provider
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collection/import/status?${query.toString()}`, {
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
		isPending: isRequestImportCollectionFromLudopediaPending,
	} = useMutation({
		mutationFn: async (externalId: string) => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collection/import/ludopedia`, {
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
			// Invalidate and refetch any queries that might be affected
			queryClient.invalidateQueries({ queryKey: ["connectionImportStatus", expandedConnection] })
		},
		onError: (error) => {
			console.error('Error requesting import collection:', error)
		},
	})

	const toggleConnection = (connection: Connection) => {
		if (connection.Provider !== "LUDOPEDIA") return

		setExpandedConnection((curValue) => curValue?.ExternalId === connection?.ExternalId ? undefined : connection)
	}

	const getImportStatusBadge = (status: string | null) => {
		if (status === "COMPLETED") {
			return (
				<Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
					Sucesso
				</Badge>
			)
		}
		if (status === "FAILED") {
			return (
				<Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50">
					Erro
				</Badge>
			)
		}
		if (status === "STARTED") {
			return (
				<Badge variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50">
					Em progresso
				</Badge>
			)
		}

		return (
			<Badge variant="outline" className="bg-gray-50 text-gray-600 hover:bg-gray-50">
				Nunca importado
			</Badge>
		)
	}

	return (
		<section className="mb-8">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold">Conexões</h2>
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" size="sm" className="gap-1">
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
			</div>

			<div className="space-y-3">
				{connections.length === 0 && (
					<p className="text-gray-600 text-center italic">Nenhuma conexão</p>
				)}
				{connections.map((connection) => (
					<div key={connection.ExternalId} className="border rounded-lg overflow-hidden">
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
								{isGettingImportStatus && (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								)}
								{importStatus && (
									<>
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => requestImportCollectionFromLudopedia(connection.ExternalId)}
													disabled={importStatus.Status == "STARTED"}
												>
													{importStatus.Status == "STARTED" || isRequestImportCollectionFromLudopediaPending ? (
														<>
															<Loader2 className="h-4 w-4 mr-2 animate-spin" />
															Importando...
														</>
													) : (
														"Importar coleção"
													)}
												</Button>
												{
													importStatus.LastImportDate && (
														<span className="text-sm text-gray-500">
															Última importação: {formatEventDate(importStatus.LastImportDate)}
														</span>
													)
												}
											</div>
											<div>{getImportStatusBadge(importStatus.Status)}</div>
										</div>

										{/* <Button
											variant="outline"
											size="sm"
											className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
											onClick={() => window.alert("Essa feature ainda não está disponivel. Para Desconectar sua conta, por favor entre em contato com os administradores.")}
										>
											Desconectar
										</Button> */}
									</>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	)
}