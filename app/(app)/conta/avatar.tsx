"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { Camera, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ImageCropper from "./image-cropper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Props {
	profileImageUrl?: string
	username: string
}

export function AvatarComponent({ profileImageUrl, username }: Props) {
	const [profileImage, setProfileImage] = useState<string | undefined>(profileImageUrl)
	const [isUploading, setIsUploading] = useState(false)
	const [showCropper, setShowCropper] = useState(false)
	const [imageFile, setImageFile] = useState<File | null>(null)

	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setImageFile(e.target.files[0])
			setShowCropper(true)
		}
	}

	const triggerFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click()
		}
	}

	const handleCroppedImage = (croppedImage: string) => {
		setProfileImage(croppedImage)
		setShowCropper(false)
		setIsUploading(true)

		// Simulate upload delay
		setTimeout(() => {
			setIsUploading(false)
		}, 1500)
	}

	return (
		<>
			<div className="flex justify-between items-end mb-4">
				<div className="relative">
					<Avatar className="h-24 w-24 border-4 border-white shadow-md">
						{profileImage ? (
							<AvatarImage src={profileImage || "/placeholder.svg"} alt={username} />
						) : (
							<AvatarFallback className="bg-red-100 text-primary text-2xl">
								{username.substring(0, 2).toUpperCase()}
							</AvatarFallback>
						)}
					</Avatar>

					{/* <Button
						size="icon"
						className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-red-950"
						onClick={triggerFileInput}
						disabled={isUploading}
					>
						{isUploading ? (
							<Loader2 className="h-4 w-4 animate-spin text-white" />
						) : (
							<Camera className="h-4 w-4 text-white" />
						)}
					</Button> */}

					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept="image/*"
						onChange={handleFileChange}
					/>
				</div>
			</div>

			<Dialog open={showCropper} onOpenChange={setShowCropper}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Ajustar imagem</DialogTitle>
						<DialogDescription>Arraste para ajustar e recortar sua foto de perfil.</DialogDescription>
					</DialogHeader>
					{imageFile && <ImageCropper imageFile={imageFile} onCropComplete={handleCroppedImage} />}
				</DialogContent>
			</Dialog>
		</>
	)
}