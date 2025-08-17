import { isBitSet } from "@/lib/permissions"
import { Crown, Shield, User } from "lucide-react"

export const getRoleIcon = (permissions?: string) => {
	if (!permissions) {
		return null
	}

	if (isBitSet(permissions, 0)) {
		return <Crown className="h-4 w-4" />
	}
	if (isBitSet(permissions, 1)) {
		return <Shield className="h-4 w-4" />
	}

	return <User className="h-4 w-4" />
}