
export function formatDisplayPrice(price?: number, amount: number = 1): string {
	if (!price) return "Gratuito"
	return `R$ ${((price * amount) / 100).toFixed(2).replace(".", ",")}`
}
