import { Metadata } from 'next';
import { Suspense } from 'react';
import { CreateImagePage } from './content';
import Loading from '@/components/ui/loading';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Adicionar imagem",
		description: 'Adicione novas fotos a nossa galeria',
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/nosso-grupo.jpg"],
		},
	}
}

export default async function Page() {
	return <Suspense fallback={<Loading />}>
		<CreateImagePage />
	</Suspense>
}