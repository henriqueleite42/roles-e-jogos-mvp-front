
export function getDescription(description: string) {
	if (description.length > 100) {
		return description.slice(0, 100) + "..."
	}

	return description
}
