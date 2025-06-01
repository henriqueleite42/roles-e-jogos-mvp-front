import GalleryPage from "./content"
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Galeria",
		description: 'Veja as fotos da nossa comunidade',
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/nosso-grupo.jpg"],
		},
	}
}

export default async function Page() {
	return <GalleryPage />
}