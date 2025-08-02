import { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import Content from "./content"

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Ingressos",
		description: "Veja seus ingressos para os eventos",
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}

export default async function Page() {
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/eventos")
	}

	return <Content />
}
