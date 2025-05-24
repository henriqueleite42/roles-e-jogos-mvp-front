"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import { Button } from "@/components/ui/button"
import "react-image-crop/dist/ReactCrop.css"

interface ImageCropperProps {
	imageFile: File
	onCropComplete: (body: {
		croppedImage: Blob
		fileName: string
	}) => void
	onCancelCrop: () => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
	return centerCrop(
		makeAspectCrop(
			{
				unit: "%",
				width: 90,
			},
			aspect,
			mediaWidth,
			mediaHeight,
		),
		mediaWidth,
		mediaHeight,
	)
}

export default function ImageCropper({ imageFile, onCropComplete, onCancelCrop }: ImageCropperProps) {
	const [crop, setCrop] = useState<Crop>()
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
	const [imgSrc, setImgSrc] = useState("")
	const imgRef = useRef<HTMLImageElement>(null)
	const aspect = 1

	useEffect(() => {
		if (imageFile) {
			const reader = new FileReader()
			reader.addEventListener("load", () => {
				setImgSrc(reader.result?.toString() || "")
			})
			reader.readAsDataURL(imageFile)
		}
	}, [imageFile])

	function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
		if (aspect) {
			const { width, height } = e.currentTarget
			setCrop(centerAspectCrop(width, height, aspect))
		}
	}

	const handleCropComplete = async () => {
		if (!completedCrop || !imgRef.current) {
			return
		}

		const image = imgRef.current
		const canvas = document.createElement("canvas")
		const ctx = canvas.getContext("2d")

		if (!ctx) {
			return
		}

		const scaleX = image.naturalWidth / image.width
		const scaleY = image.naturalHeight / image.height

		canvas.width = completedCrop.width
		canvas.height = completedCrop.height

		ctx.drawImage(
			image,
			completedCrop.x * scaleX,
			completedCrop.y * scaleY,
			completedCrop.width * scaleX,
			completedCrop.height * scaleY,
			0,
			0,
			completedCrop.width,
			completedCrop.height,
		)

		console.log("type", imageFile.type);

		const blob = await new Promise<Blob>((res, rej) => {
			canvas.toBlob((blob) => {
				if (blob) {
					res(blob)
				} else {
					rej(new Error("Failed to convert canvas to blob"))
				}
			}, imageFile.type)
		})

		onCropComplete({
			croppedImage: blob,
			fileName: imageFile.name,
		})
	}

	return (
		<div className="flex flex-col gap-4">
			{imgSrc && (
				<ReactCrop
					crop={crop}
					onChange={(_, percentCrop) => setCrop(percentCrop)}
					onComplete={(c) => setCompletedCrop(c)}
					aspect={aspect}
					circularCrop
					className="max-h-[300px] mx-auto"
				>
					<img
						ref={imgRef}
						alt="Crop preview"
						src={imgSrc || "/placeholder.svg"}
						onLoad={onImageLoad}
						className="max-h-[300px] object-contain"
					/>
				</ReactCrop>
			)}
			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={onCancelCrop}>
					Cancelar
				</Button>
				<Button className="text-white" onClick={handleCropComplete}>Aplicar</Button>
			</div>
		</div>
	)
}
