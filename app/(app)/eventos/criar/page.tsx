import { FormCreateEvent } from "./form";
import { cookies } from "next/headers"
import { redirect } from 'next/navigation';

export default async function CreateEventPage() {
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	return <FormCreateEvent />
}
