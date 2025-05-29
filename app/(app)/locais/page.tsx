import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react"
import { LocationsPageContent } from "./content";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Locais",
		description: "Veja seus locais cadastrados",
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}

export default async function LocationsPage() {
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	return <LocationsPageContent />
}
