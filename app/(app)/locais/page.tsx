import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react"
import { LocationsPageContent } from "./content";

export const metadata = {
	title: "Locais",
	description: "Veja seus locais cadastrados",
}

export default async function LocationsPage() {

	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	return <LocationsPageContent />
}
