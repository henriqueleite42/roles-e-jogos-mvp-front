import { config } from "dotenv"
import axios from "axios"
import GAMES from "./games.json";
import { writeFileSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

config()

const users = {
	"292342": {
		AccountId: 292342,
		Handle: "henriqueleite42",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
	},
	"267985": {
		AccountId: 267985,
		Handle: "denysmorais1",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_267985_1736510027.jpg"
	},
	"199395": {
		AccountId: 199395,
		Handle: "leopg",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_199395_1743049682.jpg"
	},
	"68006": {
		AccountId: 68006,
		Handle: "Gi Veiga",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_68006_1680660551.jpg"
	},
	// "296463": {
	// 	AccountId: 296463,
	// 	Handle: "lfernandomoda",
	// 	AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_296463_1743085079.jpg"
	// },
	"121554": {
		AccountId: 121554,
		Handle: "Guig",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_121554_1587335026.jpg"
	},
	"295469": {
		AccountId: 295469,
		Handle: "Ciskow",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_295469_1738464470.png"
	},
	"289094": {
		AccountId: 289094,
		Handle: "freymonkal",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_289094_1734978033.png"
	},
	"134076": {
		AccountId: 134076,
		Handle: "LuizNier",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_134076_1703527145.jpg"
	},
	"209306": {
		AccountId: 209306,
		Handle: "pcsr42",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_209306_1671769270.jpg"
	},
	"105932": {
		AccountId: 105932,
		Handle: "r0dr1600",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_105932_1736287047.jpeg"
	},
	"312126": {
		AccountId: 312126,
		Handle: "Dominguesjosue",
		AvatarUrl: "https://ludopedia.com.br/uploads/avatar/avatar_312126_1746494430.png"
	},
}

interface Owner {
	AccountId: number
	Handle: string
	AvatarUrl: string
}

interface Game {
	Id: number,
	Name: string,
	IconUrl: string,
	Kind: string,
	LudopediaId: number,
	LudopediaUrl: string,
	MinAmountOfPlayers: number
	MaxAmountOfPlayers: number
	CreatedAt: Date
}

interface GroupCollectionItem {
	Game: Game;
	Owners: Array<Owner>
}

function sleep(s: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, s * 1000));
}

async function bootstrap() {
	const games = GAMES as unknown as { [gameId: number]: GroupCollectionItem }

	for (const i in games) {
		games[i].Owners = []
	}

	const usersArr = Object.values(users)

	for (const i of usersArr) {
		const res = await axios.get(`https://ludopedia.com.br/api/v1/colecao?id_usuario=${i.AccountId}&lista=colecao&search=&ordem=data&tp_jogo=b&page=1&rows=100`, {
			headers: {
				"accept": "application/json, text/plain, */*",
				"accept-language": "en-US,en;q=0.5",
				"sec-ch-ua": "\"Brave\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Linux\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"sec-gpc": "1",
				"cookie": `PHPSESSID=${process.env.LUDOPEDIA_COOKIE}; ludo_consent_cookie=true`,
				"Referer": `https://ludopedia.com.br/colecao?lista=colecao&usuario=${encodeURIComponent(i.Handle)}`,
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
		})

		if (res.status != 200) {
			console.log(res.data)
			throw new Error("fail to get colletion")
		}

		for (const d of res.data.colecao) {
			if (games[d.id_jogo]) {
				if (!games[d.id_jogo].Owners.find(o => o.AccountId == i.AccountId)) {
					games[d.id_jogo].Owners.push(i)
				}
			} else {
				games[d.id_jogo] = {
					Game: {
						Id: d.id_jogo,
						LudopediaId: d.id_jogo,
					},
					Owners: [
						i,
					] as Array<Owner>
				} as GroupCollectionItem
			}
		}

		console.log(`successfully got collection from ${i.Handle}`);

		await sleep(0.5)
	}

	console.log("successfully got all collections");

	const client = axios.create({
		baseURL: "https://ludopedia.com.br/api/v1",
		headers: {
			"Authorization": `Bearer ${process.env.LUDOPEDIA_ACCESS_TOKEN}`
		}
	})

	const knowGamesFiles = readdirSync(join(__dirname, "jogos"))
	const knowGamesById = {} as { [gameId: string]: Game }
	for (const fileName of knowGamesFiles) {
		const fileContent = readFileSync(join(__dirname, "jogos", fileName), 'utf8')
		const game = JSON.parse(fileContent)
		knowGamesById[game.Id] = game
	}

	console.log("successfully got knowGamesById");

	const totalGamesToGet = Object.keys(games).length
	let curGamesGot = 0
	for (const gameId in games) {
		if (games[gameId].Game.Name || knowGamesById[gameId]) {
			curGamesGot++
			console.log(`successfully got ${curGamesGot}/${totalGamesToGet} games`);
			continue
		}

		const res = await client.get(`/jogos/${gameId}`)

		if (res.status == 200) {
			const game = {
				Id: res.data.id_jogo,
				Name: res.data.nm_jogo,
				IconUrl: res.data.thumb,
				LudopediaUrl: res.data.link,
				MinAmountOfPlayers: res.data.qt_jogadores_min,
				MaxAmountOfPlayers: res.data.qt_jogadores_max,
			} as Game

			if (res.data.tp_jogo == "b") {
				game.Kind = "GAME"
			}
			if (res.data.tp_jogo == "e") {
				game.Kind = "EXPANSION"
			}

			writeFileSync(join(__dirname, "jogos", `${gameId}.json`), JSON.stringify(game, null, 2))

			knowGamesById[game.Id] = game

			curGamesGot++
			console.log(`successfully got ${curGamesGot}/${totalGamesToGet} games`);

			await sleep(1)
		} else {
			console.log(res);
			throw new Error("fail to get gate")
		}
	}

	console.log("successfully got games");

	const knowGames = Object.values(knowGamesById)
	for (const game of knowGames) {
		if (!games[game.Id]) {
			continue
		}

		games[game.Id].Game = game
	}

	for (const gameId in games) {
		if (!games[gameId].Owners || games[gameId].Owners.length === 0) {
			delete games[gameId]
		}
	}

	console.log("successfully built data");

	writeFileSync(join(__dirname, `games.json`), JSON.stringify(games, null, 2))
}

bootstrap()