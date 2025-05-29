import { MediaData } from "@/types/api"
import { useCallback, useEffect, useRef, useState } from "react"

// Add this custom hook for masonry layout
export const useMasonry = (images: MediaData[], columnWidth = 300) => {
	const [columns, setColumns] = useState<MediaData[][]>([])
	const [columnCount, setColumnCount] = useState(1)
	const containerRef = useRef<HTMLDivElement>(null)

	const calculateColumns = useCallback(() => {
		if (!containerRef.current) return

		const containerWidth = containerRef.current.offsetWidth
		const gap = 16 // 1rem gap
		const newColumnCount = Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)))

		if (newColumnCount !== columnCount) {
			setColumnCount(newColumnCount)
		}
	}, [columnWidth, columnCount])

	useEffect(() => {
		calculateColumns()
		window.addEventListener("resize", calculateColumns)
		return () => window.removeEventListener("resize", calculateColumns)
	}, [calculateColumns])

	useEffect(() => {
		if (images.length === 0) return

		// Initialize columns
		const newColumns: MediaData[][] = Array.from({ length: columnCount }, () => [])
		const columnHeights = new Array(columnCount).fill(0)

		// Distribute images across columns
		images.forEach((image) => {
			// Find the shortest column
			const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))

			// Add image to shortest column
			newColumns[shortestColumnIndex].push(image)

			// Update column height (approximate based on aspect ratio)
			const aspectRatio = image.Height / image.Width
			const imageHeight = columnWidth * aspectRatio
			columnHeights[shortestColumnIndex] += imageHeight + 16 // Add gap
		})

		setColumns(newColumns)
	}, [images, columnCount, columnWidth])

	return { columns, containerRef }
}