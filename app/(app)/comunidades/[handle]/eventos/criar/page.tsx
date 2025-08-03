import { CommunityData } from "@/types/api";
import { FormCreateEvent } from "./form";
import { cookies } from "next/headers"
import { redirect } from 'next/navigation';

export const metadata = {
	title: "Criar Evento",
	description: "Crie um evento e compartilhe-o com a comunidade!",
}

export default async function CreateEventPage({ params }: { params: { handle: string } }) {
	const { handle } = await params
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/communities/handle?handle=' + handle);

	if (!res.ok) {
		console.error(await res.text())
		return undefined
	}

	const community = await res.json() as CommunityData

	return <FormCreateEvent communityId={community.Id} />
}
