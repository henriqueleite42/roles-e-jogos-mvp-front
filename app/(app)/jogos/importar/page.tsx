import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react"
import { ImportGamesPage } from "./content";

export const metadata = {
	title: "Importar jogos",
	description: "Cadastre jogos da Ludopedia na nossa base de dados para ficarem disponiveis.",
}

export default async function Page() {
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	return <ImportGamesPage />
}
