"use client"

import type React from "react"

import {
	Shield,
	Calendar,
	Ticket,
	Settings,
	Eye,
	Edit,
	Trash2,
	Plus,
	UserCheck,
	Ban,
	Crown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CommunityData, CommunityPermissions, CommunityRoleData } from "@/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { isBitSet } from "@/lib/permissions"
import { Switch } from "@/components/ui/switch"

interface PermissionCategory {
	name: string
	description: string
	icon: React.ComponentType<{ className?: string }>
	permissions: Permission[]
}

interface Permission {
	index: number
	name: string
	description: string
	implemented: boolean
	icon: React.ComponentType<{ className?: string }>
}

interface Props {
	community: CommunityData
	roleId: number
}

export const categories: PermissionCategory[] = [
	{
		name: "Administrativo",
		description: "Permissões relacionadas à administração da comunidade",
		icon: Settings,
		permissions: [
			{
				index: CommunityPermissions.Admin,
				name: "Administrador",
				description: "Pode gerenciar tudo relacionado a comunidade.",
				implemented: true,
				icon: Crown,
			},
			// {
			// 	index: -1,
			// 	name: "Gerenciar Cargos",
			// 	description: "Criar, editar e excluir cargos da comunidade",
			// 	implemented: false,
			// 	icon: Shield,
			// },
			// {
			// 	index: -1,
			// 	name: "Ver Análises",
			// 	description: "Acessar relatórios e estatísticas da comunidade",
			// 	implemented: false,
			// 	icon: Eye,
			// },
			// {
			// 	index: -1,
			// 	name: "Editar Comunidade",
			// 	description: "Modificar informações básicas da comunidade",
			// 	implemented: false,
			// 	icon: Edit,
			// },
			// {
			// 	index: -1,
			// 	name: "Banir Membros",
			// 	description: "Banir membros que violam as regras",
			// 	implemented: false,
			// 	icon: Ban,
			// },
		],
	},
	{
		name: "Eventos",
		description: "Permissões relacionadas ao gerenciamento de eventos",
		icon: Calendar,
		permissions: [
			{
				index: CommunityPermissions.EventManage,
				name: "Gerenciar Eventos",
				description: "Criar, editar ou cancelar eventos da comunidade",
				implemented: true,
				icon: Plus,
			},
			// {
			// 	index: -1,
			// 	name: "Editar Eventos",
			// 	description: "Modificar eventos existentes",
			// 	implemented: false,
			// 	icon: Edit,
			// },
			// {
			// 	index: -1,
			// 	name: "Cancelar Eventos",
			// 	description: "Cancelar eventos da comunidade",
			// 	implemented: false,
			// 	icon: Trash2,
			// },
			// {
			// 	index: -1,
			// 	name: "Gerenciar Participantes",
			// 	description: "Aprovar ou rejeitar participações em eventos",
			// 	implemented: false,
			// 	icon: UserCheck,
			// },
			// {
			// 	index: -1,
			// 	name: "Ver Análises de Eventos",
			// 	description: "Acessar estatísticas detalhadas dos eventos",
			// 	implemented: false,
			// 	icon: Eye,
			// },
		],
	},
	{
		name: "Ingressos",
		description: "Permissões relacionadas ao sistema de ingressos",
		icon: Ticket,
		permissions: [
			{
				index: CommunityPermissions.TicketValidate,
				name: "Validar Ingressos",
				description: "Escanear e validar ingressos nos eventos",
				implemented: true,
				icon: UserCheck,
			},
			// {
			// 	index: CommunityPermissions.FinanceAndLegal,
			// 	name: "Ver Vendas de Ingressos",
			// 	description: "Acessar relatórios de vendas de ingressos",
			// 	implemented: false,
			// 	icon: Eye,
			// },
			// {
			// 	index: -1,
			// 	name: "Reembolsar Ingressos",
			// 	description: "Processar reembolsos de ingressos",
			// 	implemented: false,
			// 	icon: Trash2,
			// },
		],
	},
]

export default function Content({ community, roleId }: Props) {
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const { data: role, isLoading } = useQuery<CommunityRoleData>({
		queryKey: ["community-role", community.Id, roleId],
		queryFn: async () => {
			const query = new URLSearchParams({
				roleId: String(roleId),
				communityId: String(community.Id),
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/roles/id?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
	})

	const mutation = useMutation({
		mutationFn: async ({ hasPerm, permission }: { hasPerm: boolean, permission: number }) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/roles/permissions`, {
				method: 'PATCH',
				body: JSON.stringify({
					CommunityId: community.Id,
					RoleId: roleId,
					HasPerm: hasPerm,
					Permission: permission
				}),
				headers: { 'Content-Type': 'application/json' },
				credentials: "include"
			})

			if (!res.ok) {
				console.error(await res.text())
				throw new Error(`Fail to update member role ${res.status}`)
			}
		},
		onSuccess: () => {
			toast({
				title: "Permissão atualizada!",
			})
			queryClient.invalidateQueries({ queryKey: ["community-role", community.Id, roleId] })
		},
		onError: (error) => {
			console.error('Error updating member role:', error)
			toast({
				title: "Erro",
				description: "Não foi possível atualizar a permissão.",
				variant: "destructive",
			})
		},
	})

	if (isLoading) {
		return <div>Carregando...</div>
	}

	if (!role) {
		return <div>Cargo não encontrado</div>
	}

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			{/* Role Info Card */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className={`w-4 h-4 rounded-full bg-primary`} />
							<div>
								<CardTitle className="text-xl">{role.Name}</CardTitle>
								{/* <CardDescription>{role.description}</CardDescription> */}
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							{role.IsDefaultRole && <Badge variant="secondary">Cargo Padrão</Badge>}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Permission Categories */}
			<div className="space-y-6">
				{categories.map((category) => {
					return (
						<Card key={category.name}>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary rounded-lg">
										<category.icon className="h-5 w-5 text-white" />
									</div>
									<div className="flex-1">
										<CardTitle className="text-lg">{category.name}</CardTitle>
										<CardDescription>{category.description}</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{category.permissions.map((permission, index) => (
										<div key={permission.index}>
											<div className="flex items-start gap-3">
												<Switch
													id={String(permission.index)}
													checked={isBitSet(role.Permissions, permission.index) || isBitSet(role.Permissions, CommunityPermissions.Admin)}
													onCheckedChange={(checked) =>
														mutation.mutate({
															hasPerm: checked,
															permission: permission.index,
														})
													}
													className="mt-1"
													disabled={
														role.IsDefaultRole ||
														role.IsOwnerRole ||
														(permission.index != CommunityPermissions.Admin && isBitSet(role.Permissions, CommunityPermissions.Admin))
													}
												/>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<permission.icon className="h-4 w-4 text-muted-foreground" />
														<label htmlFor={String(permission.index)} className="font-medium cursor-pointer">
															{permission.name}
														</label>
													</div>
													<p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
												</div>
											</div>
											{index < category.permissions.length - 1 && <Separator className="mt-4" />}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
	)
}
