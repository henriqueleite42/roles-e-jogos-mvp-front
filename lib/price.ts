
export function formatDisplayPrice(price?: number): string {
	if (!price) return "Gratuito"
	return `R$ ${price.toFixed(2).replace(".", ",")}`
}
