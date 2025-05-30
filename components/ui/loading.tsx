import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex items-center justify-center m-5">
			<Loader2 className="h-6 w-6 animate-spin text-gray-500" />
		</div>
	)
}
