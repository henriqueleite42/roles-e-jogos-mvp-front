import { MediaData } from "@/types/api";
import GalleryPage from "./content"
import { Metadata } from 'next';
import { cookies } from "next/headers";

interface Params {
	searchParams: {
		mediaId?: string
	}
}

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Galeria",
		description: 'Veja as fotos da nossa comunidade',
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/nosso-grupo.jpg"],
		},
	}
}

export default async function Page(params: Params) {
	const { searchParams } = await params
	const { mediaId } = await searchParams

	const cookieStore = await cookies();

	let mediaData: MediaData | undefined = undefined
	if (mediaId) {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medias?mediaId=${searchParams.mediaId}`, {
			headers: {
				Cookie: cookieStore.toString()
			},
		})

		if (response.ok) {
			mediaData = await response.json() as MediaData
		}
	}

	return <GalleryPage preSelectedMedia={mediaData} />
}