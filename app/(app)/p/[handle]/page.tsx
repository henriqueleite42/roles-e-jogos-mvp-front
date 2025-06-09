import { Header } from "@/components/header"
import { ProfileDetails } from "./details"
import { ProfileTabsContainer } from "./tabs-container"
import { redirect } from "next/navigation";
import { Profile } from "@/types/api";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
	const { handle } = await params

	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/handle?handle=' + handle, {
		method: 'GET',
	});

	if (!res.ok) {
		return {
			title: process.env.NEXT_PUBLIC_WEBSITE_NAME,
			description: 'Faça amigos e jogue jogos',
		}
	}

	const profile = await res.json() as Profile

	return {
		title: profile.Name,
		description: "",
		openGraph: profile.AvatarUrl ? ({
			images: [profile.AvatarUrl],
		}) : undefined,
	}
}

async function getProfile(handle: string, cookies: ReadonlyRequestCookies): Promise<Profile | undefined> {
	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/handle?handle=' + handle, {
		headers: {
			Cookie: cookies.toString()
		},
	});

	if (!res.ok) {
		console.error(await res.text())
		return undefined
	}

	return await res.json() as Profile
}

async function getAuth(cookies: ReadonlyRequestCookies): Promise<Profile | undefined> {
	var auth: Profile | undefined = undefined
	const resAuth = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/me', {
		headers: {
			Cookie: cookies.toString()
		},
	});
	if (resAuth.ok) {
		auth = await resAuth.json() as Profile
	}

	return auth
}

export default async function ProfilePage({ params }: { params: { handle: string } }) {
	const { handle } = await params
	const cookieStore = await cookies();

	const [profile, auth] = await Promise.all([
		getProfile(handle, cookieStore),
		getAuth(cookieStore)
	])

	if (!profile) {
		redirect('/home')
	}

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
			<Header title={profile.Handle} displayBackButton />

			<main className="flex-1 container mx-auto py-6 px-4 mb-10">
				{/* Profile Header */}
				<ProfileDetails profile={profile} auth={auth} />

				{/* Tabs Navigation */}
				<ProfileTabsContainer profile={profile} auth={auth} />
			</main>
		</div>
	)
}
