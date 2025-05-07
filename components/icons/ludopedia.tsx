import Image from "next/image";

interface Props {
	className?: string
}

export function LudopediaIcon({ className }: Props) {
	return (
		<Image
			src="/ludopedia.png"
			className={className}
			alt="Ludopedia"
			width={20}
			height={20}
		/>
	)
}