"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { LocationMarker, ResponseListLocationsMarkers } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Ll {
	lat: number
	lng: number
};

const BUSINESS_ICON = "/green-dice.png"
const PERSONAL_ICON = "/red-dice.png"

export function Map() {
	const [ready, setReady] = useState(false)
	const [selectedMarker, setSelectedMarker] = useState<LocationMarker | null>(null)

	const mapRef = useRef<HTMLDivElement>(null);

	// Use TanStack Query for data fetching with infinite scroll
	const { data: markers, isPending: isSearchingMarkers } = useQuery<ResponseListLocationsMarkers>({
		queryKey: ["list-locations-markers"],
		queryFn: async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/markers`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
	})

	useEffect(() => {
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);
		setReady(true)
	}, []);

	useEffect(() => {
		if (!ready || !window.google || !markers || !markers.Data || markers.Data.length === 0) return

		const listeners = [] as Array<any>

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const map = new window.google.maps.Map(mapRef.current!, {
					center: {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					},
					zoom: 13,
					zoomControl: false,
					mapTypeControl: false,
					streetViewControl: false,
					fullscreenControl: false,
				});

				markers.Data.forEach((marker) => {
					const markerGoogle = new window.google.maps.Marker({
						position: {
							lat: marker.Latitude,
							lng: marker.Longitude,
						},
						map,
						title: marker.Name,
						icon: {
							url: marker.Kind === "BUSINESS" ? BUSINESS_ICON : PERSONAL_ICON,
							scaledSize: new window.google.maps.Size(30, 30), // optional: resize
						}
					});

					const listener = markerGoogle.addListener('click', () => {
						console.log(marker);
						setSelectedMarker(marker)
					});

					listeners.push(listener);
				});
			},
			(error) => {
				console.error(error);
			}
		)

		// Cleanup on unmount
		return () => {
			listeners.forEach((listener) => {
				window.google.maps.event.removeListener(listener);
			});
		};
	}, [markers, ready])

	return (
		<>
			<Header title="Mapa" displayBackButton />

			<main className="overflow-hidden min-h-[84vh]">
				{
					selectedMarker && (
						<div className="absolute top-20 left-0 w-100 z-10 container px-2">
							<Card>
								<CardHeader className="text-center" >
									<CardTitle className="text-2xl">{selectedMarker.Name}</CardTitle>
								</CardHeader>
								<CardContent className="flex flex-col gap-2">
									<Button type="button" className="text-white" asChild>
										<Link href={"/locais/" + selectedMarker.Slug}>Ver mais</Link>
									</Button>
									<Button type="button" variant="outline" onClick={() => setSelectedMarker(null)}>
										Cancelar
									</Button>
								</CardContent>
							</Card>
						</div>
					)
				}

				{
					(isSearchingMarkers) && (
						<Loading />
					)
				}

				{
					(!isSearchingMarkers) && (
						<div ref={mapRef} style={{
							height: "84vh",
							width: "100vw"
						}} />
					)
				}
			</main>
		</>
	)
}
