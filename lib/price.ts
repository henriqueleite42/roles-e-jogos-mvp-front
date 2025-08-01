
export function formatDisplayPrice(price?: number): string {
	if (!price) return "Gratuito"
	return `R$ ${(price / 100).toFixed(2).replace(".", ",")}`
}
