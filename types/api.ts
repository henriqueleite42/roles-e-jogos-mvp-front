export type Provider = "GOOGLE" | "LUDOPEDIA"

export type GameKind = "GAME" | "RPG"

export type LocationKind = "BUSINESS" | "PERSONAL"

export type UploadKind = "AVATAR_IMG" | "EVENT_ICON" | "LOCATION_ICON" | "MEDIA_IMAGE" | "COMMUNITY_AVATAR_IMG"

export type NotificationType = "GAMES_COLLECTION_IMPORT_FINISH" | "MEDIA_MENTION" | "EVENT_CANCELED"

export type CollectionImportStatusEnum = "COMPLETED" | "FAILED" | "STARTED" | "NOT_YET_IMPORTED"

export type EventType = "FREE" | "PAID_ON_SITE" | "BUY_ON_THIRD_PARTY"

export type AchievementId = "CONNECT_LUDOPEDIA"
	| "CONNECT_DISCORD"
	| "CREATE_ONE_EVENT"
	| "CREATE_TEN_EVENTS"
	| "CREATE_FIFTY_EVENTS"
	| "CREATE_ONE_HUNDRED_EVENTS"
	| "ATTEND_ONE_EVENT"
	| "ATTEND_TEN_EVENTS"
	| "ATTEND_FIFTY_EVENTS"
	| "ATTEND_ONE_HUNDRED_EVENTS"
	| "PERSONAL_COLLECTION_ONE_GAME"
	| "PERSONAL_COLLECTION_TEN_GAMES"
	| "PERSONAL_COLLECTION_FIFTY_GAMES"
	| "PERSONAL_COLLECTION_ONE_HUNDRED_GAMES"

export type CommunityAffiliationType = "PUBLIC" | "INVITE_ONLY"

export type EventTicketStatus = "WAITING_PAYMENT" | "PAID" | "ATTENDED"

export interface ResponseGetNextEvents {
	Data: Array<MinimumEventDataWithLocation>
	Pagination: {
		Current?: string
		Limit: number
		Next?: string
	}
}

export interface ResponseEvents {
	Data: Array<EventData>
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

export interface EventTicketData {
	Id: number
	Status: EventTicketStatus
	CreatedAt: string
	PaidAt?: string
	AttendedAt?: string
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

export interface MinimumGameData {
	Id: number;
	Name: string;
	Slug: string;
	IconUrl?: string;
	Kind: GameKind;
	MinAmountOfPlayers: number;
	MaxAmountOfPlayers: number;
	AverageDuration: number;
	MinAge: number;
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

export interface EventData {
	Id: number
	Name: string
	Description: string
	Type: EventType
	Slug: string
	IconUrl?: string
	StartDate: string
	EndDate: string
	Capacity?: number
	ExternalUrl?: string
	Price?: number
	Location: {
		Id: number
		Name: string
		Slug: string
		Address: string
		IconUrl?: string
	}
	Organizer: MinimumCommunityData
}

export interface EventPlannedMatch {
	Id: number
	GameId: number
	GameIconUrl?: string
	Name: string
	Description: string
	MaxAmountOfPlayers: number
	StartDate?: string
	EndDate?: string
	Price?: number
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
	Price?: number
}

export interface MinimumEventDataWithLocation extends MinimumEventData {
	Location: MinimumLocationData
}

export interface ResponseSearchLocations {
	Data: Array<LocationData>
}

export interface ResponseSearchGames {
	Data: Array<MinimumGameData>
}

export interface ResponseSearchPersonalGames {
	Data: Array<GameData>
	Pagination: PaginationId
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

export interface MinimumMediaData {
	Id: number
	Url: string
	Width: number
	Height: number
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

export interface AccountEventTicket {
	Event: MinimumEventData
	Amount: number
}

export interface CommunityData {
	AffiliationType: CommunityAffiliationType,
	AvatarUrl?: string,
	CreatedAt: string,
	Handle: string,
	Id: number,
	Name: string
	Description: string
	MemberCount: number,
	Location: {
		IconUrl?: string
		Id: number
		Name: string
		Slug: string
		City: string
		State: string
	}
}

export interface MinimumCommunityData {
	Id: number,
	Handle: string,
	AvatarUrl?: string,
}

export interface CommunityMemberData {
	Profile: MinimumProfileData
	Role: {
		Id: number
		Name: string
		Permission: string
	}
	IsOwner: boolean
	MemberSince: string
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
	Data: Array<MinimumMediaData>
	Pagination: PaginationId
}

export interface ResponseListGameOwners {
	Data: Array<MinimumProfileData>
	Pagination: PaginationString
}

export interface EventTicketBuyer {
	Profile: MinimumProfileData
	AmountOfTickets: number
}

export interface ResponseListEventTicketBuyers {
	Data: Array<EventTicketBuyer>
	Pagination: PaginationString
}


export interface ResponseListEventPlannedMatches {
	Data: Array<EventPlannedMatch>
	Pagination: PaginationString
}

export interface ResponseListEventsByGame {
	Data: Array<MinimumEventDataWithLocation>
	Pagination: PaginationTimestampId
}

export interface ResponseListEventsByAccount {
	Data: Array<MinimumEventDataWithLocation>
	Pagination: PaginationTimestampId
}

export interface ResponseListEventsByLocation {
	Data: Array<MinimumEventDataWithLocation>
	Pagination: PaginationTimestampId
}

export interface ResponseListEventsByCommunity {
	Data: Array<MinimumEventDataWithLocation>
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

export interface Owner {
	AccountId: number
	AvatarUrl?: string
	Handle: string
}

export interface GameCollection {
	Game: {
		IconUrl?: string
		Id: number
		LudopediaUrl?: string
		MaxAmountOfPlayers: number
		MinAmountOfPlayers: number
		Name: string
		Slug: string
	}
	Owners: Array<Owner>
}

export interface ResponseGames {
	Data: Array<GameCollection>
	Pagination: PaginationString
}

export interface ConnectionData {
	AccountId: number
	Provider: Provider
	ExternalHandle?: string
	ExternalId: string
	CreatedAt: string
}

export interface ResponseListConnections {
	Data: Array<ConnectionData>
}

export interface ConnectionImportStatus {
	Status: CollectionImportStatusEnum
	LastImportDate?: string
}

export interface NotificationData {
	Id: number
	Type: NotificationType
	Timestamp: string
	ReadAt?: string
	ExecutedAt?: string
	Data: string
}

export interface NotificationDataGamesCollectionFinish {
	Status: CollectionImportStatusEnum
}

export interface NotificationDataMediaMention {
	MediaId: number
	Sender: MinimumProfileData
}

export interface NotificationDataEventCanceled {
	Event: MinimumEventData
}

export interface ResponseListLatestNotifications {
	Data: Array<NotificationData>
	Pagination: PaginationId
}

export interface AccountAchievementData {
	Id: AchievementId
	IsSecret: boolean
	Name: string
	Description: string
	IconUrl: string
	RequiredAmount: number
	Progress?: number
	AchievedAt?: string
}

export interface ResponseListAccountAchievements {
	Data: Array<AccountAchievementData>
	Pagination: PaginationId
}

export interface ResponseListCommunities {
	Data: Array<CommunityData>
	Pagination: PaginationId
}

export interface ResponseListCommunityMembers {
	Data: Array<CommunityMemberData>
	Pagination: PaginationString
}

export interface ResponseAccountEventTickets {
	Data: Array<AccountEventTicket>
	Pagination: PaginationTimestampId
}

export interface ResponseAccountEventTicketsByEvent {
	Data: Array<EventTicketData>
	Pagination: PaginationId
}

export interface ResponseListCommunitiesManagedByUser {
	Data: Array<MinimumCommunityData>
	Pagination: PaginationString
}

export interface ResponseValidateTicket {
	Event: MinimumEventData
	Profile: MinimumProfileData
	Ticket: EventTicketData
}