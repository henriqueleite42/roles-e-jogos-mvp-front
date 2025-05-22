import { FormCreateEvent } from "./form";
import { cookies } from "next/headers"
import { redirect } from 'next/navigation';

export const metadata = {
	title: "Criar Evento",
	description: "Crie um evento e compartilhe-o com a comunidade!",
}

export default async function CreateEventPage() {
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	return <FormCreateEvent />
}
