import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { GoogleIcon } from "@/components/icons/google"
import { LudopediaIcon } from "@/components/icons/ludopedia"
import Link from "next/link"

const connectionsIcons = {
	"GOOGLE": {
		icon: GoogleIcon,
		color: "bg-google"
	},
	"LUDOPEDIA": {
		icon: LudopediaIcon,
		color: "bg-ludopedia"
	}
}

const availableProviders = [
	{
		Provider: "GOOGLE",
		Url: process.env.GOOGLE_REDIRECT_URI!
	},
	{
		Provider: "LUDOPEDIA",
		Url: process.env.LUDOPEDIA_REDIRECT_URI!
	},
]

function toPascalCase(str: string) {
	const lower = str.toLowerCase();
	return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function Connections() {
	const connections = [
		{ ExternalId: "1", ExternalHandle: "foobar", Provider: "GOOGLE" },
	]

	return (
		<section className="mb-8">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold">Conexões</h2>
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" size="sm" className="gap-1">
							<Plus className="h-4 w-4" /> Adicionar
						</Button>
					</SheetTrigger>
					<SheetContent side="bottom" className="h-[400px]">
						<SheetHeader className="text-left">
							<SheetTitle>Adicionar conexão</SheetTitle>
							<SheetDescription>Conecte sua conta a outros serviços para facilitar o login e integrações.</SheetDescription>
						</SheetHeader>
						<div className="grid gap-4 py-4">
							{
								availableProviders.map(p => (
									<Link key={p.Provider} href={p.Url || ""} className="grid">
										<Button
											variant="outline"
											className="justify-start gap-3 h-14"
										>
											<div className={`${connectionsIcons[p.Provider as keyof typeof connectionsIcons].color} p-2 rounded-full`}>
												{connectionsIcons[p.Provider as keyof typeof connectionsIcons].icon({
													className: "h-5 w-5 text-white"
												})}
											</div>
											<span>Conectar com {toPascalCase(p.Provider)}</span>
										</Button>
									</Link>
								))
							}
						</div>
					</SheetContent>
				</Sheet>
			</div>

			<div className="space-y-3">
				{connections.length === 0 && (
					<p className="text-gray-600 text-center italic">Nenhuma conexão</p>
				)}
				{connections.length > 0 && connections.map((connection) => (
					<div key={connection.ExternalId} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
						<div className="flex items-center gap-3">
							<div className={`p-2 rounded-full text-white ${connectionsIcons[connection.Provider as keyof typeof connectionsIcons].color}`}>
								{connectionsIcons[connection.Provider as keyof typeof connectionsIcons].icon({
									className: "h-5 w-5 text-white"
								})}
							</div>
							<div>
								<p className="text-base font-medium">{toPascalCase(connection.Provider)}</p>
								<p className="text-xs">Conta: {connection.ExternalHandle || connection.ExternalId}</p>
							</div>
						</div>
						<div>
							<Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
								Conectado
							</Badge>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}