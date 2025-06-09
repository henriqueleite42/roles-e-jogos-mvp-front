"use client"

import { useEffect, useState } from "react"
import { Map } from "./map";

type LocationStatus = "LOADING" | "NOT_SUPPORTED" | "SUCCESS"

function Message({ title, description }: { title: string, description: string }) {
	return (
		<div className="flex flex-col justify-center align-center w-full h-[80vh] text-center">
			<h2 className="text-l">{title}</h2>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	)
}

export function MapPage() {
	const [status, setStatus] = useState<LocationStatus>("LOADING")
	const [error, setError] = useState<GeolocationPositionError>()

	useEffect(() => {
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);
	}, []);

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				() => {
					setStatus("SUCCESS")
				},
				(error) => {
					setError(error)
				}
			);
		} else {
			setStatus("NOT_SUPPORTED")
		}
	}, [])

	if (error) {
		return <Message title="Falha ao carregar mapa" description={error.message} />
	}

	if (status === "NOT_SUPPORTED") {
		return <Message title="Seu navegador não suporta essa função" description="Recomendamos o uso do Google Chrome" />
	}

	if (status === "LOADING") {
		return <Message title="Precisamos de sua localização" description="Para poder exibir o mapa, precisamos que você aceite a permissão de localização" />
	}

	return <Map />
}