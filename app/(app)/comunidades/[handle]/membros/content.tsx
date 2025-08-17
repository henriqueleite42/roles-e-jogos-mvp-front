"use client"

import { useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Crown, Pencil, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CommunityData, CommunityMemberData, CommunityRole, ResponseListCommunityMembers, ResponseListCommunityRoles } from "@/types/api"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getRoleBadge } from "../members"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getRoleIcon } from "../../utils"

interface Props {
	member: CommunityMemberData
	community: CommunityData
}

export default function Content({ community, member }: Props) {
	const queryClient = useQueryClient()
	const { toast } = useToast()

	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteQuery<ResponseListCommunityMembers>({
		queryKey: ["community-members", community.Id],
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {
				communityId: String(community.Id),
			}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/members?${query.toString()}`, {
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

	const { data: roles, isLoading } = useQuery<ResponseListCommunityRoles>({
		queryKey: ["community-all-roles", community.Id],
		queryFn: async () => {
			const query = new URLSearchParams({
				limit: String(100),
				communityId: String(community.Id),
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/roles?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
	})

	const rolesFiltered = useMemo(() => {
		if (!roles?.Data) return []

		const allowedRoles = []

		for (const role of roles.Data) {
			if (!role.IsOwnerRole) {
				allowedRoles.push(role)
			}
		}

		return allowedRoles
	}, [roles])

	// Observer for infinite scroll
	const observerTarget = useRef<HTMLDivElement | null>(null)

	// Intersection Observer for infinite scroll
	useEffect(() => {
		if (!hasNextPage || !observerTarget.current || isFetchingNextPage) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchNextPage()
				}
			},
			{ threshold: 0.5 },
		)

		observer.observe(observerTarget.current)

		return () => {
			observer.disconnect()
		}
	}, [hasNextPage, isFetchingNextPage])

	const mutation = useMutation({
		mutationFn: async ({ member, newRoleIdStr }: { member: CommunityMemberData, newRoleIdStr: string }) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/members/role`, {
				method: 'PATCH',
				body: JSON.stringify({
					CommunityId: community.Id,
					MemberId: member.Profile.Id,
					NewRoleId: parseInt(newRoleIdStr, 10),
				}),
				headers: { 'Content-Type': 'application/json' },
				credentials: "include"
			})

			if (!res.ok) {
				console.error(await res.text())
				throw new Error(`Fail to update member role ${res.status}`)
			}

			return {
				member,
				role: roles?.Data?.find(r => String(r.Id) === newRoleIdStr),
			}
		},
		onSuccess: ({ member, role }: { member: CommunityMemberData, role?: CommunityRole }) => {
			if (role) {
				toast({
					title: "Cargo atualizado!",
					description: `${member?.Profile.Handle} agora é ${role?.Name}.`,
				})
			} else {
				toast({
					title: "Cargo atualizado!",
				})
			}
			queryClient.invalidateQueries({ queryKey: ["community-members", community.Id] })
		},
		onError: (error) => {
			console.error('Error updating member role:', error)
			toast({
				title: "Erro",
				description: "Não foi possível atualizar o cargo do membro.",
				variant: "destructive",
			})
		},
	})

	if (isPending || isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
					<div className="h-32 bg-gray-200 rounded mb-6"></div>
					<div className="space-y-4">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="h-20 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		)
	}

	return (
		<main className="m-2">
			<div className="flex justify-center align-center mb-2 gap-2">
				<Button className="text-white" asChild>
					<Link href={"/comunidades/" + community.Handle + "/cargos"}>
						<Pencil className="h-4 w-4" />
						Editar cargos
					</Link>
				</Button>
			</div>

			{/* Members List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Membros da Comunidade
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{allItems.map((member) => (
							<div
								key={member.Profile.Id}
								className="flex flex-col p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-2"
							>
								<div className="flex items-center gap-4">
									<Avatar className="w-12 h-12">
										<AvatarImage src={member.Profile.AvatarUrl || "/placeholder.svg"} alt={member.Profile.Handle} />
										<AvatarFallback>
											{member.Profile.Handle.slice(0, 2)}
										</AvatarFallback>
									</Avatar>

									<div className="flex items-center gap-2 mb-1">
										<h3 className="font-semibold text-gray-900">{member.Profile.Handle}</h3>
										{getRoleBadge(member.Role)}
									</div>
								</div>

								{
									member.IsOwner && (
										<Select
											value="FORBIDDEN"
											disabled={true}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="FORBIDDEN">
													<div className="flex items-center gap-2">
														<Crown className="h-4 w-4" />
														{roles?.Data.find(r => r.IsOwnerRole)?.Name}
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									)
								}
								{
									!member.IsOwner && (
										<Select
											value={String(member.Role.Id)}
											onValueChange={(value: string) => mutation.mutate({
												member: member,
												newRoleIdStr: value
											})}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{rolesFiltered.map(role => (
													<SelectItem key={role.Id} value={String(role.Id)}>
														<div className="flex items-center gap-2">
															{getRoleIcon(role.Permissions)}
															{role.Name}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)
								}
							</div>
						))}

						{allItems.length === 0 && (
							<div className="text-center py-8">
								<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum membro encontrado</h3>
								<p className="text-gray-600">
									Esta comunidade ainda não possui membros.
								</p>
							</div>
						)}

						{/* Infinite scroll observer element */}
						<div ref={observerTarget} className="w-full py-4 flex justify-center">
							{isFetchingNextPage && (
								<div className="flex items-center gap-2">
									<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
									<span className="text-sm text-muted-foreground">Carregando mais jogos...</span>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</main>
	)
}
