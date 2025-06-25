"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { useCurLocation } from "@/hooks/use-cur-location";
import { LocationMarker, ResponseListLocationsMarkers } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const BUSINESS_ICON = "/green-dice.png"
const PERSONAL_ICON = "/red-dice.png"

export function Map() {
	const { status, latLong } = useCurLocation()

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
		enabled: status === "SUCCESS"
	})

	useEffect(() => {
		if (status !== "SUCCESS" || !window.google || !markers || !markers.Data || markers.Data.length === 0) return

		const listeners = [] as Array<any>

		const map = new window.google.maps.Map(mapRef.current!, {
			center: {
				lat: latLong!.Latitude,
				lng: latLong!.Longitude
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
				setSelectedMarker(marker)
			});

			listeners.push(listener);
		});

		// Cleanup on unmount
		return () => {
			listeners.forEach((listener) => {
				window.google.maps.event.removeListener(listener);
			});
		};
	}, [markers, status])

	return (
		<>
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
		</>
	)
}
