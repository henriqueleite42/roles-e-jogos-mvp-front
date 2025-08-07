import { Header } from "@/components/header"
import { CommunityDetails } from "./details"
import { ProfileTabsContainer } from "./tabs-container"
import { redirect } from "next/navigation";
import { CommunityData, CommunityMemberData } from "@/types/api";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getDescription } from "@/lib/description";

async function getCommunity(handle: string): Promise<CommunityData | undefined> {
	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/communities/handle?handle=' + handle);

	if (!res.ok) {
		console.error(await res.text())
		return undefined
	}

	return await res.json() as CommunityData
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
	const community = await getCommunity(params.handle)

	if (!community) {
		return {
			title: process.env.NEXT_PUBLIC_WEBSITE_NAME,
			description: 'Faça amigos e jogue jogos',
			openGraph: {
				images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
			},
		}
	}

	return {
		title: community.Name,
		description: getDescription(community.Description),
		openGraph: community.AvatarUrl ? ({
			images: [community.AvatarUrl],
		}) : undefined,
	}
}

async function getMember(cookies: ReadonlyRequestCookies, communityId: number): Promise<CommunityMemberData | undefined> {
	const query = new URLSearchParams({
		communityId: String(communityId),
	})

	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/communities/member?${query.toString()}`, {
		headers: {
			Cookie: cookies.toString()
		},
	});

	if (!res.ok) {
		console.error(await res.text())
		return undefined
	}

	return await res.json() as CommunityMemberData
}

export default async function ProfilePage({ params }: { params: { handle: string } }) {
	const { handle } = await params
	const cookieStore = await cookies();

	const community = await getCommunity(handle)

	if (!community) {
		redirect('/comunidades')
	}

	const member = await getMember(cookieStore, community.Id)

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
			<Header title={community.Name} displayBackButton />

			<main className="flex-1 container mx-auto py-6 px-4 mb-10">
				{/* Profile Header */}
				<CommunityDetails community={community} member={member} />

				{/* Tabs Navigation */}
				<ProfileTabsContainer community={community} member={member} />
			</main>
		</div>
	)
}
