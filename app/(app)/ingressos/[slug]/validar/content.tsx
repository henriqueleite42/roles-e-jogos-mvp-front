"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, CheckCircle, XCircle, Scan, AlertCircle } from "lucide-react"
import { Toast, toast } from "@/hooks/use-toast"
import QrScanner from "qr-scanner"
import { useMutation } from "@tanstack/react-query"
import { EventData, ResponseValidateTicket } from "@/types/api"
import "./QrStyles.css";

interface Params {
	event: EventData
}

export default function ValidateTicketsPage({ event }: Params) {
	const [isScanning, setIsScanning] = useState(false)
	const [hasPermission, setHasPermission] = useState<boolean | null>(null)
	const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(null)
	const [validationResult, setValidationResult] = useState<ResponseValidateTicket | null>(null)
	const [scannedCodes, setScannedCodes] = useState<string[]>([])
	const [hasCamera, setHasCamera] = useState<boolean | null>(null)

	const videoRef = useRef<HTMLVideoElement>(null)
	const qrScannerRef = useRef<QrScanner | null>(null)

	const mutation = useMutation({
		mutationFn: async (reqUrl: string) => {
			const url = new URL(reqUrl)
			url.searchParams.set("eventId", String(event.Id))

			const res = await fetch(url.toString(), {
				method: "POST",
				credentials: "include"
			})

			if (!res.ok) {
				const txt = await res.text()
				console.error(txt)
				throw new Error(txt)
			}

			return await res.json() as ResponseValidateTicket
		},
		onSuccess: (response) => {
			setValidationResult(response)
		},
		onError: (error) => {
			console.error('Error validating event:', error)

			let message = error.message
			if (error.message.includes("forbidden")) {
				message = "Você não tem permissão para validar ingressos desse evento"
			}
			if (error.message.includes("forbidden: user is not ticket owner")) {
				message = "Ingresso falsificado"
			}
			if (error.message.includes("forbidden: ticket doesn't belongs to this event")) {
				message = "Ingresso não pertence a esse evento"
			}
			if (error.message.includes("bad request: user already attended event")) {
				message = "Ingresso já foi utilizado"
			}
			if (error.message.includes("bad request: ticket not paid yet")) {
				message = "Ingresso ainda não foi pago"
			}

			setValidationErrorMsg(message)
		},
	})

	// Check if camera is available
	useEffect(() => {
		QrScanner.hasCamera().then((hasCamera) => {
			setHasCamera(hasCamera)
			if (!hasCamera) {
				toast({
					title: "Câmera não encontrada",
					description: "Nenhuma câmera foi detectada neste dispositivo.",
					variant: "destructive",
				})
			}
		})
	}, [])

	// Initialize QR Scanner
	const initializeScanner = () => {
		if (!videoRef.current) return

		qrScannerRef.current = new QrScanner(
			videoRef.current,
			(result) => {
				handleQRCodeDetected(result.data)
			},
			{
				onDecodeError: (error) => {
					// Silently handle decode errors - they're normal when no QR code is visible
					console.debug("QR decode error:", error)
				},
				highlightScanRegion: true,
				highlightCodeOutline: true,
				preferredCamera: "environment",
				maxScansPerSecond: 2,
			},
		)
	}

	// Start camera scanning
	const startScanning = async () => {
		if (!hasCamera) {
			toast({
				title: "Câmera não disponível",
				description: "Nenhuma câmera foi encontrada neste dispositivo.",
				variant: "destructive",
			})
			return
		}

		try {
			if (!qrScannerRef.current) {
				initializeScanner()
			}

			if (qrScannerRef.current) {
				await qrScannerRef.current.start()
				setIsScanning(true)
				setHasPermission(true)
			}
		} catch (error) {
			console.error("Failed to start QR scanner:", error)
			setHasPermission(false)

			let errorMessage = "Não foi possível acessar a câmera."

			if (error instanceof Error) {
				if (error.name === "NotAllowedError") {
					errorMessage = "Permissão de câmera negada. Verifique as configurações do navegador."
				} else if (error.name === "NotFoundError") {
					errorMessage = "Nenhuma câmera foi encontrada."
				} else if (error.name === "NotSupportedError") {
					errorMessage = "Câmera não suportada neste navegador."
				} else if (error.name === "NotReadableError") {
					errorMessage = "Câmera está sendo usada por outro aplicativo."
				}
			}

			toast({
				title: "Erro de Câmera",
				description: errorMessage,
				variant: "destructive",
			})
		}
	}

	// Stop camera scanning
	const stopScanning = () => {
		if (qrScannerRef.current) {
			qrScannerRef.current.stop()
		}
		setIsScanning(false)
	}

	// Handle QR code detection
	const handleQRCodeDetected = async (qrCodeData: string) => {
		if (mutation.isPending || scannedCodes.includes(qrCodeData)) return

		// Check if the QR code contains a valid URL
		if (!process.env.NEXT_PUBLIC_API_URL!.startsWith("http://localhost") && !qrCodeData.startsWith("https")) {
			toast({
				title: "QR Code Inválido",
				description: "O QR code escaneado não contém uma URL válida.",
				variant: "destructive",
			})
			return
		}

		setScannedCodes((prev) => [...prev, qrCodeData])
		stopScanning()

		// Provide haptic feedback if available
		if (navigator.vibrate) {
			navigator.vibrate(200)
		}

		try {
			// Make API request to validate the QR code
			await mutation.mutate(qrCodeData)
		} catch (error) {
			console.error("Validation error:", error)
			setValidationErrorMsg("Erro ao validar ingresso. Verifique sua conexão e tente novamente.")
		}
	}

	// Close validation dialog and restart scanning
	const closeValidationDialog = () => {
		setValidationResult(null)
		setValidationErrorMsg(null)
		if (hasCamera && hasPermission) {
			startScanning()
		}
	}

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (qrScannerRef.current) {
				qrScannerRef.current.destroy()
			}
		}
	}, [])

	return (
		<main className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Validar Ingressos</h1>
				<p className="text-muted-foreground">Use a câmera para escanear QR codes dos ingressos e validar a entrada</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Scan className="h-5 w-5" />
						Scanner de QR Code
					</CardTitle>
					<CardDescription>Posicione o QR code do ingresso na frente da câmera para validação</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Camera Permission Status */}
					{hasPermission === false && (
						<div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
							<AlertCircle className="h-5 w-5" />
							<span>Permissão de câmera negada. Verifique as configurações do navegador.</span>
						</div>
					)}

					{/* No Camera Available */}
					{hasCamera === false && (
						<div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
							<AlertCircle className="h-5 w-5" />
							<span>Nenhuma câmera foi encontrada neste dispositivo.</span>
						</div>
					)}

					{/* Camera View */}
					<div className="relative">
						<div className="aspect-video bg-black rounded-lg overflow-hidden relative w-80 h-80">
							<video
								ref={videoRef}
								className="w-full h-full object-cover"
								autoPlay
								playsInline
								muted
							/>

							{!isScanning && (
								<div className="absolute w-full h-full flex items-center justify-center text-white top-0 left-0">
									<div className="text-center">
										<Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
										<p className="text-lg">Câmera desligada</p>
										<p className="text-sm opacity-75">Clique em "Iniciar Scanner" para começar</p>
									</div>
								</div>
							)}

							{/* Validation indicator */}
							{mutation.isPending && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<div className="bg-white rounded-lg p-4 flex items-center gap-3">
										<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
										<span>Validando ingresso...</span>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Controls */}
					<div className="flex gap-4">
						{!isScanning ? (
							<Button
								onClick={startScanning}
								className="flex-1 text-white"
								disabled={hasPermission === false || hasCamera === false}
							>
								<Camera className="h-4 w-4 mr-2" />
								Iniciar Scanner
							</Button>
						) : (
							<Button
								onClick={stopScanning}
								variant="outline"
								className="flex-1 bg-transparent"
								disabled={mutation.isPending}
							>
								<CameraOff className="h-4 w-4 mr-2" />
								Parar Scanner
							</Button>
						)}
					</div>

					{/* Instructions */}
					<div className="text-sm text-muted-foreground space-y-2">
						<p>• Posicione o QR code dentro da área destacada</p>
						<p>• Mantenha o dispositivo estável para melhor leitura</p>
						<p>• Certifique-se de que há iluminação adequada</p>
					</div>

					{/* Scanned codes counter */}
					{scannedCodes.length > 0 && (
						<div className="text-center">
							<Badge variant="secondary">
								{scannedCodes.length} ingresso{scannedCodes.length !== 1 ? "s" : ""} escaneado
								{scannedCodes.length !== 1 ? "s" : ""}
							</Badge>
						</div>
					)}

					{/* Debug info */}
					{process.env.NODE_ENV === "development" && (
						<div className="text-xs text-muted-foreground space-y-1 p-2 bg-gray-50 rounded">
							<p>Debug Info:</p>
							<p>• Camera: {hasCamera === null ? "Loading..." : hasCamera ? "Available" : "Not available"}</p>
							<p>• Permission: {hasPermission === null ? "Not requested" : hasPermission ? "Granted" : "Denied"}</p>
							<p>• Scanning: {isScanning ? "Active" : "Inactive"}</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Validation Result Dialog */}
			<Dialog open={Boolean(validationErrorMsg) || Boolean(validationResult)} onOpenChange={() => closeValidationDialog()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-3">
							{!validationErrorMsg && validationResult ? (
								<>
									<CheckCircle className="h-6 w-6 text-green-500" />
									Ingresso Válido
								</>
							) : (
								<>
									<XCircle className="h-6 w-6 text-red-500" />
									Ingresso Inválido
								</>
							)}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						{!validationErrorMsg && validationResult ? (
							<div className="text-center space-y-3">
								<div className="text-2xl font-bold text-green-600">✓ Entrada Autorizada</div>
								<div className="space-y-2">
									<p className="text-lg font-semibold">{validationResult.Profile.Handle}</p>
									<p className="text-sm text-muted-foreground">Evento: {event.Name}</p>
									<p className="text-xs text-muted-foreground">Ingresso: #{validationResult.Ticket.Id.toString().padStart(6, "0")}</p>
								</div>
							</div>
						) : (
							<div className="text-center space-y-3">
								<div className="text-2xl font-bold text-red-600">✗ Entrada Negada</div>
								<p className="text-muted-foreground">{validationErrorMsg}</p>
							</div>
						)}

						<Button
							onClick={closeValidationDialog}
							className="w-full text-white"
							variant={!validationErrorMsg && validationResult ? "default" : "destructive"}
						>
							Continuar Escaneando
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</main>
	)
}
