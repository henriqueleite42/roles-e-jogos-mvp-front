import { cookies } from "next/headers"
import { Header } from "@/components/header";
import { redirect } from "next/navigation";
import Content from "./content"

export default async function Page() {
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	return (
		<>
			<Header title="Criar Comunidade" displayBackButton />

			<Content />
		</>
	)
}