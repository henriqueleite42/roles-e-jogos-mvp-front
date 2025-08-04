"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, CheckCircle, XCircle, Scan, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
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
				console.error(await res.text())
				throw new Error(`Fail to join community ${res.status}`)
			}

			return await res.json() as ResponseValidateTicket
		},
		onSuccess: (response) => {
			setValidationResult(response)
		},
		onError: (error) => {
			console.error('Error uploading or updating profile img:', error)
			toast({
				title: "Erro ao entrar na comunidade",
				description: error.message,
				variant: "destructive",
			})
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
		if (!qrCodeData.startsWith("https")) {
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
								style={{ display: isScanning ? "block" : "none" }}
							/>

							{!isScanning && (
								<div className="w-full h-full flex items-center justify-center text-white">
									<div className="text-center">
										<Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
										<p className="text-lg">Câmera desligada</p>
										<p className="text-sm opacity-75">Clique em "Iniciar Scanner" para começar</p>
									</div>
								</div>
							)}

							{/* Scanning overlay */}
							{isScanning && (
								<div className="absolute inset-0 flex items-center justify-center pointer-events-none w-80 h-80">
									<div className="w-64 h-64 border-2 border-orange-500 rounded-lg relative">
										<div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
										<div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-lg"></div>
										<div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-lg"></div>
										<div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-lg"></div>
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
				</CardContent>
			</Card>

			{/* Validation Result Dialog */}
			<Dialog open={!!validationResult} onOpenChange={() => setValidationResult(null)}>
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
									<p className="text-sm text-muted-foreground">Evento: {validationResult.Event.Name}</p>
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
							className="w-full"
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
