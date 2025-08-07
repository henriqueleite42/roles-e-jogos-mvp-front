import { CommunityData, ResponseListCommunitiesManagedByUser } from "@/types/api";
import { Content } from "./content";
import { cookies } from "next/headers"
import { redirect } from 'next/navigation';

export const metadata = {
	title: "Editar Comunidade",
	description: "Edite sua comunidade",
}

export default async function EditCommunityPage({ params }: { params: { handle: string } }) {
	const { handle } = await params
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	// Community

	const resCommunity = await fetch(process.env.NEXT_PUBLIC_API_URL + "/communities/handle?handle=" + handle, {
		method: "GET",
		credentials: "include"
	})

	if (!resCommunity.ok) {
		console.error(await resCommunity.text())
		redirect("/communities")
	}

	const community = await resCommunity.json() as CommunityData

	if (!community) {
		redirect("/communities")
	}

	// Managed communities

	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/communities/managed', {
		method: 'GET',
		cache: 'no-store',
		headers: {
			Cookie: cookieStore.toString()
		}
	}).catch(() => ({
		ok: false
	} as Response));

	if (!res.ok) {
		console.error(await res.text())
		redirect(`/communities/${handle}`)
	}

	const managedCommunities = await res.json() as ResponseListCommunitiesManagedByUser

	if (managedCommunities.Data.length === 0) {
		console.error("user has no managed communities")
		redirect(`/communities/${handle}`)
	}

	if (!managedCommunities.Data.find(i => i.Id === community.Id)) {
		console.error("user do not manage this community")
		redirect(`/communities/${handle}`)
	}

	return <Content community={community} />
}
