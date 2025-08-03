"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Profile } from "@/types/api"
import { useMemo, useState } from "react"
import { ProfileGames } from "./games"
import { ProfileEvents } from "./events"
import { ProfileGallery } from "./gallery"
import { Connections } from "./connections"
import { ProfileAchievements } from "./achievements"

interface Props {
	auth?: Profile
	profile: Profile
}

interface Tab {
	key: string
	description: string
	getComponent: (i: Props) => React.ReactElement
	shouldDisplay: (i: Props) => boolean
}

const TABS: Array<Tab> = [
	{
		key: "connections",
		description: "Conexões",
		getComponent: ({ profile, auth }: Props) => (<Connections profile={profile} auth={auth} />),
		shouldDisplay: ({ profile, auth }: Props) => profile.AccountId === auth?.AccountId
	},
	{
		key: "games",
		description: "Jogos",
		getComponent: ({ profile }: Props) => (<ProfileGames profile={profile} />),
		shouldDisplay: () => true
	},
	{
		key: "events",
		description: "Eventos",
		getComponent: ({ profile }: Props) => (<ProfileEvents profile={profile} />),
		shouldDisplay: () => true
	},
	{
		key: "gallery",
		description: "Galeria",
		getComponent: ({ profile }: Props) => (<ProfileGallery profile={profile} />),
		shouldDisplay: () => true
	},
	{
		key: "achievements",
		description: "Conquistas",
		getComponent: ({ profile }: Props) => (<ProfileAchievements profile={profile} />),
		shouldDisplay: () => true
	},
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