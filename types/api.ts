export type Provider = "GOOGLE" | "LUDOPEDIA"

export type GameKind = "GAME" | "RPG"

export type EventAttendanceStatus = "GOING" | "NOT_GOING" | "MAYBE"

export type LocationKind = "BUSINESS" | "PERSONAL"

// Attendance status types
export type AttendanceStatus = "GOING" | "NOT_GOING" | "MAYBE" | null

export type UploadKind = "AVATAR_IMG" | "EVENT_ICON" | "LOCATION_ICON" | "MEDIA_IMAGE"

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

export interface PaginationTimestampId {
	Current?: {
		Timestamp: string
		Id: number
	}
	Next?: {
		Timestamp: string
		Id: number
	}
	Limit: number
}

export interface PaginationId {
	Current?: number
	Next?: number
	Limit: number
}

export interface GameData {
	Id: number;
	Name: string;
	Description: string;
	Slug: string;
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

export interface Auth {
	AccountId: number;
	IsAdmin: boolean;
	Subscription?: string
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
	Slug: string
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
		Slug: string
		Address: string
		IconUrl?: string
	}
}

export interface LocationData {
	Id: number
	Name: string
	Slug: string
	Address: string
	ZipCode: string
	City: string;
	State: string;
	Neighborhood: string;
	Latitude: number;
	Longitude: number;
	IconUrl?: string
	Kind: LocationKind
	CreatedBy: number
	CreatedAt: Date
}

export interface MinimumLocationData {
	Id: number
	Name: string
	IconUrl?: string
}

export interface MinimumEventData {
	Id: number
	IconUrl?: string
	Slug: string
	Name: string
	StartDate: string
}

export interface MinimumEventDataWithLocation extends MinimumEventData {
	Location: MinimumLocationData
}

export interface ResponseSearchLocations {
	Data: Array<LocationData>
}

export interface ResponseSearchGames {
	Data: Array<GameData>
}

export interface ResponseSearchEvents {
	Data: Array<MinimumEventDataWithLocation>
}

export interface MinimumProfileData {
	AccountId: number
	Handle: string
	AvatarUrl?: string
}

export interface ResponseSearchProfiles {
	Data: Array<MinimumProfileData>
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

export interface MediaData {
	Id: number
	Description?: string
	Url: string
	Width: number
	Height: number
	CreatedAt: string
	Owner: {
		AccountId: number
		Handle: string
		AvatarUrl?: string
	}
	Game?: {
		Id: number
		Name: string
		Slug: string
		IconUrl?: string
	}
	Event?: {
		Id: number
		Name: string
		Slug: string
		IconUrl?: string
	}
	Location?: {
		Id: number
		Name: string
		Slug: string
		IconUrl?: string
	}
}

export interface ExternalLocation {
	Name: string
	ZipCode: string
	State: string
	City: string
	Neighborhood: string
	FullAddress: string
	Latitude: number
	Longitude: number
}

export interface LocationMarker {
	Id: number
	Name: string
	Slug: string
	Latitude: number
	Longitude: number
	Kind: LocationKind
}

export interface ResponseGetGallery {
	Data: Array<MediaData>
	Pagination: PaginationId
}

export interface ResponseListGameOwners {
	Data: Array<MinimumProfileData>
	Pagination: PaginationString
}

export interface ResponseListEventsByGame {
	Data: Array<MinimumEventData>
	Pagination: PaginationTimestampId
}

export interface ResponseSearchExternalLocations {
	Data: Array<ExternalLocation>
}

export interface ResponseListLocationsMarkers {
	Data: Array<LocationMarker>
}

export interface ResponseGetEvents {
	Data: Array<MinimumEventData>
	Pagination: PaginationTimestampId
}
