export type Provider = "GOOGLE" | "LUDOPEDIA"

export type GameKind = "GAME" | "RPG"

export type EventAttendanceStatus = "GOING" | "NOT_GOING" | "MAYBE"

export type LocationKind = "BUSINESS" | "PERSONAL"

// Attendance status types
export type AttendanceStatus = "GOING" | "NOT_GOING" | "MAYBE" | null

export type UploadKind = "AVATAR_IMG" | "EVENT_ICON" | "LOCATION_ICON"

export interface ResponseEvents {
	Data: Array<Event>
	Pagination: {
		Current?: string
		Limit: number
		Next?: string
	}
}

export interface PaginationString {
	Current?: string
	Next?: string
	Limit: number
}

export interface GameData {
	Id: number;
	Name: string;
	Description: string;
	IconUrl?: string;
	Kind: GameKind;
	LudopediaId?: number;
	LudopediaUrl?: string;
	MinAmountOfPlayers: number;
	MaxAmountOfPlayers: number;
	AverageDuration: number;
	MinAge: number;
	CreatedAt: Date;
}

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

export interface EventAttendance {
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
	Slug: string
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
	Attendances: Array<EventAttendance>
}

export interface LocationData {
	Id: number
	Name: string
	Address: string
	IconUrl?: string
	Kind: LocationKind
	CreatedBy: number
	CreatedAt: Date
}

export interface ResponseSearchLocations {
	Data: Array<LocationData>
}

export interface ResponseSearchGames {
	Data: Array<GameData>
}

export interface ResponseListLocations {
	Data: Array<LocationData>
	Pagination: PaginationString
}

export interface RequestUploadUrlInput {
	Kind: UploadKind;
	Ext: string
}

export interface UploadUrl {
	Method: string
	Headers?: string // JSON string
	Values?: string // JSON string
	Url: string
	FilePath: string
}

export interface LudopediaGame {
	LudopediaId: number
	Name: string
	IconUrl: string
}

export interface ResponseSearchLudopediaGames {
	Data: Array<LudopediaGame>
}