"use client"

import { useState, useEffect } from "react"

const DELAY = 750

export function useDebounce(value: string): string {
	const [debouncedValue, setDebouncedValue] = useState<string>(value)

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value)
		}, DELAY)

		return () => {
			clearTimeout(timer)
		}
	}, [value, DELAY])

	return debouncedValue
}
