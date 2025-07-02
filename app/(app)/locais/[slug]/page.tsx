import Image from "next/image"
import {
	Building2,
	Home,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LocationData, Profile } from "@/types/api"
import { Header } from "@/components/header"
import { redirect } from 'next/navigation';
import { Metadata } from "next"
import { LocationDetails } from "./details"
import { LocationAddress } from "./address"
import { LocationImages } from "./images"
import { LocationEvents } from "./events"
import { cookies } from "next/headers"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const cookieStore = await cookies();
	const { slug } = await params

	const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/locations?slug=" + slug, {
		method: 'GET',
		headers: {
			Cookie: cookieStore.toString()
		},
	})

	if (!response.ok) {
		return {
			title: process.env.NEXT_PUBLIC_WEBSITE_NAME,
			description: 'Faça amigos e jogue jogos',
		}
	}

	const location = await response.json() as LocationData

	return {
		title: location.Name,
		description: location.Address,
		openGraph: location.IconUrl ? ({
			images: [location.IconUrl],
		}) : undefined,
	}
}

export default async function LocationDetailsPage({ params }: { params: { slug: string } }) {
	const cookieStore = await cookies();
	const { slug } = await params

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect('/home')
	}

	const resLocation = await fetch(process.env.NEXT_PUBLIC_API_URL + "/locations?slug=" + slug, {
		method: 'GET',
		headers: {
			Cookie: cookieStore.toString()
		},
	})

	if (!resLocation.ok) {
		console.error(await resLocation.text())
		redirect('/locais')
	}

	const location = await resLocation.json() as LocationData

	if (!location) {
		redirect('/locais')
	}

	const resAccount = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/me', {
		method: 'GET',
		headers: {
			Cookie: cookieStore.toString()
		},
		cache: 'no-store',
	});

	if (!resAccount.ok) {
		console.error(await resAccount.text())
		redirect('/locais')
	}

	const profile: Profile = await resAccount.json();

	if (location.Kind == "PERSONAL" && location.CreatedBy != profile.AccountId) {
		redirect('/locais')
	}

	return (
		<>
			<Header title={location?.Name || "Carregando..."} displayBackButton />

			<main className="flex-1 px-4 py-6 space-y-6 mb-10">
				{/* Location Header */}
				<Card className="overflow-hidden">
					<div className="h-64 relative">
						<Image src={location.IconUrl || "/placeholder.svg"} alt={location.Name} fill className="object-cover" />
						<div className="absolute top-4 right-4 flex gap-2">
							<Badge
								className={cn(
									location.Kind === "BUSINESS"
										? "bg-blue-100 text-blue-800 hover:bg-blue-100"
										: "bg-green-100 text-green-800 hover:bg-green-100",
								)}
							>
								{location.Kind === "BUSINESS" ? (
									<Building2 className="h-3 w-3 mr-1" />
								) : (
									<Home className="h-3 w-3 mr-1" />
								)}
								{location.Kind === "BUSINESS" ? "Comercial" : "Pessoal"}
							</Badge>
							{/* {location.o && (
								<Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
									Meu Local
								</Badge>
							)} */}
						</div>
					</div>
					<LocationDetails location={location} />
				</Card>

				{/* Address Information */}
				<LocationAddress location={location} />

				{/* Image Gallery */}
				<LocationImages location={location} />

				{/* Related Events */}
				<LocationEvents location={location} />
			</main>
		</>
	)
}
