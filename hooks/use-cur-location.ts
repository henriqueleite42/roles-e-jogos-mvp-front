"use client"

import { useState, useEffect } from "react"

interface LatLong {
	Latitude: number
	Longitude: number
}

type CurLocationStatus = "PENDING" | "SUCCESS"

export const DEFAULT_LAT_LONG: LatLong = {
	Latitude: -22.909125507101045,
	Longitude: -47.06255842128543
}

export function useCurLocation() {
	const [latLong, setLatLong] = useState<LatLong | undefined>(undefined)
	const [status, setStatus] = useState<CurLocationStatus>("PENDING")

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(data) => {
					setLatLong({
						Latitude: data.coords.latitude,
						Longitude: data.coords.longitude
					})
					setStatus("SUCCESS")
				},
				(error) => {
					console.error(error);
					setLatLong(DEFAULT_LAT_LONG)
					setStatus("SUCCESS")
				}
			);
		} else {
			setLatLong(DEFAULT_LAT_LONG)
			setStatus("SUCCESS")
		}
	}, [])

	return {
		latLong,
		status
	}
}
