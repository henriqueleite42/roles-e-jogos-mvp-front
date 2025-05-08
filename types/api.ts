export interface Connection {
	ExternalHandle?: string;
	ExternalId: string;
	Provider: "GOOGLE" | "LUDOPEDIA";
}

export interface Profile {
	AccountId: number;
	AvatarUrl?: string;
	Handle: string;
	Name?: string;
	Connections: Array<Connection>
}