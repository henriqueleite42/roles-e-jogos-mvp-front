"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Plus, Shield, Trash2 } from "lucide-react"
import Link from "next/link"
import { CommunityData, ResponseListCommunityRoles } from "@/types/api"
import { getRoleIcon } from "../membros/content"
import { useInfiniteQuery } from "@tanstack/react-query"
import { isBitSet } from "@/lib/permissions"

interface Props {
	community: CommunityData
}

export function getRoleColorClass(permissions: string) {
	if (!permissions) {
		return "bg-gray-100"
	}

	if (isBitSet(permissions, 0)) {
		return "bg-primary text-white"
	}
	if (isBitSet(permissions, 1)) {
		return "bg-blue-800 text-blue-100"
	}

	return "bg-gray-100"
}

export default function CommunityRolesPage({ community }: Props) {
	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteQuery<ResponseListCommunityRoles>({
		queryKey: ["community-roles", community.Id],
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {
				communityId: String(community.Id),
			}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/roles?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
		getNextPageParam: (lastPage) => {
			// Return undefined if there are no more pages or if nextCursor is not provided
			return lastPage.Pagination.Next || undefined
		},
		initialPageParam: null,
		enabled: Boolean(community.Id)
	})

	// Process all items from all pages
	const allItems = useMemo(() => {
		if (!data) return []

		// Flatten the pages array and extract items from each page
		return data.pages.flatMap((page) => page.Data || [])
	}, [data])


	if (isPending) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
					<div className="h-32 bg-gray-200 rounded mb-6"></div>
					<div className="space-y-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-24 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-6 max-w-6xl">

			{/* Actions */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-xl font-semibold">Gerenciar Cargos</h2>
					<p className="text-muted-foreground">Configure os cargos e suas permissões</p>
				</div>
				<Button className="text-white" disabled>
					<Plus className="h-4 w-4 mr-2" />
					Criar Cargo
				</Button>
			</div>

			{/* Roles List */}
			<div className="space-y-4">
				{allItems.map((role) => (
					<Card key={role.Id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-6 ">
							<div className="flex flex-col gap-2">
								<div className="flex justify-start items-center gap-4">
									<div className="flex items-center gap-3">
										<div className={`w-3 h-3 rounded-full ${getRoleColorClass(role.Permissions)}`} />
										<div className="p-2 bg-gray-100 rounded-lg">{getRoleIcon(role.Permissions)}</div>
									</div>

									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<h3 className="text-lg font-semibold">{role.Name}</h3>
											{(role.IsDefaultRole || role.IsOwnerRole) && (
												<Badge variant="secondary" className="text-xs">
													Padrão
												</Badge>
											)}
										</div>
										{/* <p className="text-muted-foreground text-sm mb-2">{role.description}</p> */}
									</div>
								</div>

								<div className="flex items-center justify-end gap-2">
									{(role.IsDefaultRole || role.IsOwnerRole) && (
										<Button variant="outline" size="sm" asChild>
											<Link href={`/comunidades/${community.Handle}/cargos/${role.Id}`}>
												<Eye className="h-4 w-4 mr-2" />
												Ver Permissões
											</Link>
										</Button>
									)}
									{(!role.IsDefaultRole && !role.IsOwnerRole) && (
										<Button variant="outline" size="sm" asChild>
											<Link href={`/comunidades/${community.Handle}/cargos/${role.Id}`}>
												<Edit className="h-4 w-4 mr-2" />
												Editar Permissões
											</Link>
										</Button>
									)}


									<Button
										variant="outline"
										size="sm"
										className="text-red-600 hover:text-red-700 bg-transparent"
										disabled={role.IsDefaultRole || role.IsOwnerRole}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{allItems.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center">
						<Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum cargo encontrado</h3>
						<p className="text-gray-600 mb-6">
							Esta comunidade ainda não possui cargos configurados. Crie o primeiro cargo para começar.
						</p>
						<Button className="text-white">
							<Plus className="h-4 w-4 mr-2" />
							Criar Primeiro Cargo
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
