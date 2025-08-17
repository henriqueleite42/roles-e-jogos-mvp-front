import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isBitSet } from "@/lib/permissions";
import { CommunityData, MinimumCommunityRoleData, ResponseListCommunityMembers } from "@/types/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

export const getRoleBadge = (role?: MinimumCommunityRoleData) => {
	if (!role?.Permissions) {
		return null
	}

	if (isBitSet(role.Permissions, 0)) {
		return (
			<Badge className="text-xs">
				{role.Name}
			</Badge>
		)
	}
	if (isBitSet(role.Permissions, 1)) {
		return (
			<Badge variant="secondary" className="text-xs bg-blue-800 text-blue-100">
				{role.Name}
			</Badge>
		)
	}

	return null
}

export function Members({ community }: { community: CommunityData }) {
	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, error } = useInfiniteQuery<ResponseListCommunityMembers>({
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

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Membros ({community.MemberCount})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{isPending && (
						<div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[100vh]">
							<Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
							<p className="text-lg text-muted-foreground">Carregando membros...</p>
						</div>
					)}
					{error && (
						<div className="container mx-auto py-8 px-4">
							<Alert variant="destructive" className="mb-6">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Erro ao carregar membros: {error.message}. Por favor, tente novamente mais tarde.
								</AlertDescription>
							</Alert>
							<Button onClick={() => window.location.reload()}>Tentar novamente</Button>
						</div>
					)}
					{allItems.map((member) => (
						<Link href={"/p/" + member.Profile.Handle} key={member.Profile.Id}>
							<Card key={member.Profile.Id} className="hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<div className="flex items-center gap-4">
										<Avatar className="w-12 h-12">
											<AvatarImage src={member.Profile.AvatarUrl || "/placeholder.svg"} alt={member.Profile.Handle} />
											<AvatarFallback>
												{member.Profile.Handle.split(" ")
													.map((word) => word[0])
													.join("")
													.slice(0, 2)}
											</AvatarFallback>
										</Avatar>

										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="font-semibold">{member.Profile.Handle}</h3>
												{getRoleBadge(member.Role)}
											</div>
											<p className="text-gray-600 text-sm">@{member.Profile.Handle}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}

					{/* Infinite scroll observer element */}
					<div ref={observerTarget} className="w-full py-4 flex justify-center">
						{isFetchingNextPage && (
							<div className="flex items-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
								<span className="text-sm text-muted-foreground">Carregando mais membros...</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}