"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { Camera, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ImageCropper from "./image-cropper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMutation } from "@tanstack/react-query"
import { UploadUrl } from "@/types/api"
import { uploadImage } from "@/lib/api/upload-image"
import { useToast } from "@/hooks/use-toast"

interface Props {
	profileImageUrl?: string
	username: string
}

interface Body {
	croppedImage: Blob
	fileName: string
}

export function AvatarComponent({ profileImageUrl, username }: Props) {
	const { toast } = useToast()
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

	const {
		mutate: uploadImg,
		isPending: isUploadingImg,
	} = useMutation({
		mutationFn: async ({ croppedImage, fileName }: Body) => {
			const { FilePath } = await uploadImage({
				FileName: fileName,
				ImageBlob: croppedImage,
				Kind: "AVATAR_IMG"
			})

			const responseUpdateProfile = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
				method: "PUT",
				body: JSON.stringify({
					AvatarPath: FilePath,
				}),
				headers: { 'Content-Type': 'application/json' },
				credentials: "include"
			})

			if (!responseUpdateProfile.ok) {
				console.error(await responseUpdateProfile.text())
				throw new Error(`Fail to update profile ${responseUpdateProfile.status}`)
			}
		},
		onSuccess: () => {
			window.location.reload()
			setShowCropper(false)
		},
		onError: (error) => {
			if (error.message === "file size exceeded") {
				toast({
					title: "Erro ao atualizar imagem de perfil",
					description: "Imagem grande de mais, limite de 5 MB",
					variant: "destructive",
				})
				return
			}

			console.error('Error uploading or updating profile img:', error)
			toast({
				title: "Erro ao atualizar imagem de perfil",
				description: error.message,
				variant: "destructive",
			})
		},
	})

	const onCancelCrop = () => {
		setShowCropper(false)
	}

	return (
		<>
			<div className="flex justify-between items-end mb-4">
				<div className="relative">
					<Avatar className="h-24 w-24 border-4 border-white shadow-md">
						{profileImageUrl ? (
							<AvatarImage src={profileImageUrl || "/placeholder.svg"} alt={username} />
						) : (
							<AvatarFallback className="bg-red-100 text-primary text-2xl">
								{username.substring(0, 2).toUpperCase()}
							</AvatarFallback>
						)}
					</Avatar>

					<Button
						size="icon"
						className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-red-950"
						onClick={triggerFileInput}
						disabled={isUploadingImg}
					>
						{isUploadingImg ? (
							<Loader2 className="h-4 w-4 animate-spin text-white" />
						) : (
							<Camera className="h-4 w-4 text-white" />
						)}
					</Button>

					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept=".png,.jpg,.jpeg,.webp"
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
					{imageFile && <ImageCropper imageFile={imageFile} onCropComplete={uploadImg} onCancelCrop={onCancelCrop} />}
				</DialogContent>
			</Dialog>
		</>
	)
}