import { Auth } from "@/types/api";

// Check if user is allowed to do something
export function canDo(auth?: Auth) {
	if (!auth) return false

	if (auth.IsAdmin) return true

	// Add subscriptions bellow
	return false
}