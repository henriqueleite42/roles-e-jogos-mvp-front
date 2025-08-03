"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommunityData, CommunityMemberData } from "@/types/api"
import { useMemo, useState } from "react"
import { ProfileGames } from "./games"
import { ProfileEvents } from "./events"
import { ProfileGallery } from "./gallery"
import { ProfileMembers } from "./members"

interface Props {
	member?: CommunityMemberData
	community: CommunityData
}

interface Tab {
	key: string
	description: string
	getComponent: (i: Props) => React.ReactElement
	shouldDisplay: (i: Props) => boolean
}

const TABS: Array<Tab> = [
	{
		key: "members",
		description: "Membros",
		getComponent: ({ community }: Props) => (<ProfileMembers community={community} />),
		shouldDisplay: () => true
	},
	{
		key: "games",
		description: "Jogos",
		getComponent: ({ community }: Props) => (<ProfileGames community={community} />),
		shouldDisplay: () => true
	},
	{
		key: "events",
		description: "Eventos",
		getComponent: ({ community }: Props) => (<ProfileEvents community={community} />),
		shouldDisplay: () => true
	},
	// {
	// 	key: "gallery",
	// 	description: "Galeria",
	// 	getComponent: ({ community }: Props) => (<ProfileGallery community={community} />),
	// 	shouldDisplay: () => true
	// },
]

export function ProfileTabsContainer(i: Props) {
	const validTabs = useMemo(() => {
		return TABS.filter(t => t.shouldDisplay(i))
	}, [i])

	const [activeTab, setActiveTab] = useState(validTabs[0].key)

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
			<TabsList className="flex w-full justify-around">
				{validTabs.map(tab => (
					<TabsTrigger key={tab.key} value={tab.key} className="w-full">{tab.description}</TabsTrigger>
				))}
			</TabsList>


			{validTabs.map(tab => (
				<TabsContent key={tab.key} value={tab.key} className="space-y-6">
					{tab.getComponent(i)}
				</TabsContent>
			))}
		</Tabs>
	)
}