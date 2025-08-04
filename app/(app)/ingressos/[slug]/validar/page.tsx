import { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import Content from "./content"
import { EventData, ResponseListCommunitiesManagedByUser } from "@/types/api";
import { Header } from "@/components/header";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Validar Ingressos",
		description: "Valide ingressos para seu evento",
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}

export default async function Page({ params }: { params: { slug: string } }) {
	const { slug } = await params

	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

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
		redirect("/ingressos")
	}

	const resJson = await res.json() as ResponseListCommunitiesManagedByUser

	if (resJson.Data.length === 0) {
		console.error(await res.text())
		redirect("/ingressos")
	}

	// Event

	const resEvent = await fetch(process.env.NEXT_PUBLIC_API_URL + "/events?slug=" + slug, {
		method: "GET",
		credentials: "include"
	})

	if (!resEvent.ok) {
		console.error(await resEvent.text())
		redirect("/ingressos")
	}

	const event = await resEvent.json() as EventData

	if (!event) {
		redirect("/ingressos")
	}

	return (
		<>
			<Header title="Validar Ingressos" displayBackButton />

			<Content event={event} />
		</>
	)
}
