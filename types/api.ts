export type Provider = "GOOGLE" | "LUDOPEDIA"

export type GameKind = "GAME" | "RPG"

export type EventAttendanceStatus = "GOING" | "NOT_GOING" | "MAYBE"

export interface Connection {
	ExternalHandle?: string;
	ExternalId: string;
	Provider: Provider;
}

export interface Profile {
	AccountId: number;
	AvatarUrl?: string;
	Handle: string;
	Name?: string;
	Connections: Array<Connection>
}

export interface EventGame {
	Id: number
	Name: string
	IconUrl?: string
	Kind: GameKind
	LudopediaUrl?: string
	MinAmountOfPlayers: number
	MaxAmountOfPlayers: number
	AverageDuration: number
	MinAge: number
}

export interface EventAtendance {
	AccountId: number
	Handle: string
	AvatarUrl?: string
	Status: EventAttendanceStatus
}

export interface Event {
	Id: number
	OwnerId: number
	Name: string
	Description: string
	IconUrl?: string
	StartDate: string
	EndDate?: string
	Capacity?: number
	Location: {
		Id: number
		Name: string
		Address: string
		IconUrl?: string
	}
	Games: Array<EventGame>
	Attendances: Array<EventAtendance>
}