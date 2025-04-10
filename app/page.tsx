"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Users } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const items = Object.values({
	"70": {
		"Game": {
			"Id": 70,
			"LudopediaId": 70,
			"Name": "Village",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/70_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/village",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"71": {
		"Game": {
			"Id": 71,
			"LudopediaId": 71,
			"Name": "Zombicide",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/71_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/zombicide",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"333": {
		"Game": {
			"Id": 333,
			"LudopediaId": 333,
			"Name": "Fungi",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/333_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/fungi-morels",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 2,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"397": {
		"Game": {
			"Id": 397,
			"LudopediaId": 397,
			"Name": "Catan: O Jogo",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/397_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/catan-the-settlers-of-catan",
			"MinAmountOfPlayers": 3,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"612": {
		"Game": {
			"Id": 612,
			"LudopediaId": 612,
			"Name": "Dixit: Odyssey",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/612_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/dixit-odyssey",
			"MinAmountOfPlayers": 3,
			"MaxAmountOfPlayers": 12,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"618": {
		"Game": {
			"Id": 618,
			"LudopediaId": 618,
			"Name": "Uno",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/618_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/uno",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 10,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"772": {
		"Game": {
			"Id": 772,
			"LudopediaId": 772,
			"Name": "Alhambra",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/772_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/alhambra",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"1041": {
		"Game": {
			"Id": 1041,
			"LudopediaId": 1041,
			"Name": "Dominó",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/1041_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/dominoes",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"1261": {
		"Game": {
			"Id": 1261,
			"LudopediaId": 1261,
			"Name": "Jaipur",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/1261_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/jaipur",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 2,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"1896": {
		"Game": {
			"Id": 1896,
			"LudopediaId": 1896,
			"Name": "Abalone / Polaris",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/1896_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/abalone-polaris",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 2,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"3857": {
		"Game": {
			"Id": 3857,
			"LudopediaId": 3857,
			"Name": "Dobble",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/3857_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/dobble-spot-it",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 8,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"3952": {
		"Game": {
			"Id": 3952,
			"LudopediaId": 3952,
			"Name": "UNO Stacko",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/3952_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/uno-stacko",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 10,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"4699": {
		"Game": {
			"Id": 4699,
			"LudopediaId": 4699,
			"Name": "La Granja",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/4699_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/la-granja",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"11466": {
		"Game": {
			"Id": 11466,
			"LudopediaId": 11466,
			"Name": "Histórias Sinistras 3",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/11466_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/black-stories-3",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 15,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"15400": {
		"Game": {
			"Id": 15400,
			"LudopediaId": 15400,
			"Name": "Bandido",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/15400_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/bandido",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"15752": {
		"Game": {
			"Id": 15752,
			"LudopediaId": 15752,
			"Name": "Hora de Aventura: Roleplaying Game",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/15752_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/hora-de-aventuras-juego-de-rol-rpg",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 10,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"15853": {
		"Game": {
			"Id": 15853,
			"LudopediaId": 15853,
			"Name": "Hippo",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/15853_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/hippo",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"17305": {
		"Game": {
			"Id": 17305,
			"LudopediaId": 17305,
			"Name": "The Mind",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/17305_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/the-mind",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"17906": {
		"Game": {
			"Id": 17906,
			"LudopediaId": 17906,
			"Name": "Gizmos",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/17906_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/gizmos",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"18135": {
		"Game": {
			"Id": 18135,
			"LudopediaId": 18135,
			"Name": "Claim 2",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/18135_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/claim-2",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 2,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"18439": {
		"Game": {
			"Id": 18439,
			"LudopediaId": 18439,
			"Name": "Fae",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/18439_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/fae",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"18993": {
		"Game": {
			"Id": 18993,
			"LudopediaId": 18993,
			"Name": "Barrage",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/18993_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/barrage",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"19973": {
		"Game": {
			"Id": 19973,
			"LudopediaId": 19973,
			"Name": "Elementar: Morte em 4 de Julho",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/19973_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/q-death-on-4th-of-july",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 8,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"19974": {
		"Game": {
			"Id": 19974,
			"LudopediaId": 19974,
			"Name": "Elementar: Última Chamada",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/19974_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/sherlock-last-call",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 8,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"19975": {
		"Game": {
			"Id": 19975,
			"LudopediaId": 19975,
			"Name": "Elementar: A Tumba do Arqueólogo",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/19975_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/q-tomb-of-the-archaeologist",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 8,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"20870": {
		"Game": {
			"Id": 20870,
			"LudopediaId": 20870,
			"Name": "LHAMA",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/20870_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/-l-l-a-m-a",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"21817": {
		"Game": {
			"Id": 21817,
			"LudopediaId": 21817,
			"Name": "Carnival Zombie (Segunda Edição)",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/21817_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/carnival-zombie-second-edition",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"23152": {
		"Game": {
			"Id": 23152,
			"LudopediaId": 23152,
			"Name": "Banco Imobiliário Mundo",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/23152_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/banco-imobiliario-mundo",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"23156": {
		"Game": {
			"Id": 23156,
			"LudopediaId": 23156,
			"Name": "Café",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/23156_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/cafe",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"23331": {
		"Game": {
			"Id": 23331,
			"LudopediaId": 23331,
			"Name": "Super Cats",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/23331_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/super-cats",
			"MinAmountOfPlayers": 3,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"24032": {
		"Game": {
			"Id": 24032,
			"LudopediaId": 24032,
			"Name": "Telma (2ª Edição)",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/24032_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/telma-2-edicao",
			"MinAmountOfPlayers": 4,
			"MaxAmountOfPlayers": 8,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"24141": {
		"Game": {
			"Id": 24141,
			"LudopediaId": 24141,
			"Name": "Golem",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/24141_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/golem",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"24269": {
		"Game": {
			"Id": 24269,
			"LudopediaId": 24269,
			"Name": "Taco Gato Cabra Queijo Pizza",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/24269_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/taco-cat-goat-cheese-pizza",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 8,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"24635": {
		"Game": {
			"Id": 24635,
			"LudopediaId": 24635,
			"Name": "Vampiro - Sozinho na Escuridão",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/24635_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/vampiro-sozinho-na-escuridao",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 1,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"25925": {
		"Game": {
			"Id": 25925,
			"LudopediaId": 25925,
			"Name": "Flourish",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/25925_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/flourish",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 7,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"26076": {
		"Game": {
			"Id": 26076,
			"LudopediaId": 26076,
			"Name": "A Herança de Cthulhu",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/26076_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/a-heranca-de-cthulhu",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"26078": {
		"Game": {
			"Id": 26078,
			"LudopediaId": 26078,
			"Name": "Frostpunk: The Board Game",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/26078_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/frostpunk-the-board-game",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"26234": {
		"Game": {
			"Id": 26234,
			"LudopediaId": 26234,
			"Name": "Mysterium Park",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/26234_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/mysterium-park",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"26473": {
		"Game": {
			"Id": 26473,
			"LudopediaId": 26473,
			"Name": "Canvas",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/26473_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/canvas",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 5,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"26753": {
		"Game": {
			"Id": 26753,
			"LudopediaId": 26753,
			"Name": "3 Jogos: Ludo, Dama, Trilha",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/26753_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/3-jogos-ludo-dama-trilha",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"29051": {
		"Game": {
			"Id": 29051,
			"LudopediaId": 29051,
			"Name": "Pandemic: Zona Crítica - Europa",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/29051_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/pandemic-hot-zone-europe",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"31085": {
		"Game": {
			"Id": 31085,
			"LudopediaId": 31085,
			"Name": "Lume",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/31085_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/glow",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"31177": {
		"Game": {
			"Id": 31177,
			"LudopediaId": 31177,
			"Name": "Monopoly: Bid",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/31177_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/monopoly-bid",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 5,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"31428": {
		"Game": {
			"Id": 31428,
			"LudopediaId": 31428,
			"Name": "City of Mist: Guia do Jogador",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/31428_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/city-of-mist-player-s-guide",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 10,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"32443": {
		"Game": {
			"Id": 32443,
			"LudopediaId": 32443,
			"Name": "Licantropo - Maldição de Sangue",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/32443_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/licantropo-maldicao-de-sangue",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 1,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"32444": {
		"Game": {
			"Id": 32444,
			"LudopediaId": 32444,
			"Name": "Bruxo - Pacto das Sombras",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/32444_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/bruxo-pacto-das-sombras",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 1,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"32453": {
		"Game": {
			"Id": 32453,
			"LudopediaId": 32453,
			"Name": "Savage",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/32453_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/savage",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"33333": {
		"Game": {
			"Id": 33333,
			"LudopediaId": 33333,
			"Name": "Tindaya",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/33333_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/tindaya",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"34618": {
		"Game": {
			"Id": 34618,
			"LudopediaId": 34618,
			"Name": "As 7 Baladas do Oeste",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/34618_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/as-7-baladas-do-oeste",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 10,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"35117": {
		"Game": {
			"Id": 35117,
			"LudopediaId": 35117,
			"Name": "Santa Kaos",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/35117_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/santa-kaos",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"35122": {
		"Game": {
			"Id": 35122,
			"LudopediaId": 35122,
			"Name": "UNO: All Wild!",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/35122_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/uno-all-wild",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 10,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"35130": {
		"Game": {
			"Id": 35130,
			"LudopediaId": 35130,
			"Name": "Alieninjas",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/35130_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/alieninjas",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"36508": {
		"Game": {
			"Id": 36508,
			"LudopediaId": 36508,
			"Name": "Four Against Darkness: Contra os Grandes Antigos",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/36508_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/four-against-darkness-four-against-the-great-old-ones",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"36562": {
		"Game": {
			"Id": 36562,
			"LudopediaId": 36562,
			"Name": "Oh My Brain",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/36562_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/oh-my-brain",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 5,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"40988": {
		"Game": {
			"Id": 40988,
			"LudopediaId": 40988,
			"Name": "Férias em Dupla",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/40988_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/ferias-em-dupla",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"52242": {
		"Game": {
			"Id": 52242,
			"LudopediaId": 52242,
			"Name": "Zurvivors Origem",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/52242_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/zurvivors-origem",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"52818": {
		"Game": {
			"Id": 52818,
			"LudopediaId": 52818,
			"Name": "Quartz: O Jogo de Cartas",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/52818_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/quartz-o-jogo-de-cartas",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"53216": {
		"Game": {
			"Id": 53216,
			"LudopediaId": 53216,
			"Name": "Trolls e Princesas",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/53216_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/trolls-and-princesses",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"53927": {
		"Game": {
			"Id": 53927,
			"LudopediaId": 53927,
			"Name": "Chulé",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/53927_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/chule",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 6,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"57670": {
		"Game": {
			"Id": 57670,
			"LudopediaId": 57670,
			"Name": "Apiary",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/57670_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/apiary",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 5,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"58247": {
		"Game": {
			"Id": 58247,
			"LudopediaId": 58247,
			"Name": "Fuga do Sanatório Moreau",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/58247_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/fuga-do-sanatorio-moreau",
			"MinAmountOfPlayers": 1,
			"MaxAmountOfPlayers": 7,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"66307": {
		"Game": {
			"Id": 66307,
			"LudopediaId": 66307,
			"Name": "Rolling Ranch: Celeiros & Rebanhos",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/66307_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/rolling-ranch-celeiros-rebanhos",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 99,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"66840": {
		"Game": {
			"Id": 66840,
			"LudopediaId": 66840,
			"Name": "Azul Mini: Pavilhão de Verão",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/66840_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/azul-summer-pavilion-mini",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"67134": {
		"Game": {
			"Id": 67134,
			"LudopediaId": 67134,
			"Name": "Balaio de Gato",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/67134_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/balaio-de-gato",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 2,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"69678": {
		"Game": {
			"Id": 69678,
			"LudopediaId": 69678,
			"Name": "Wilderfeast",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/69678_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/wilderfeast",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 10,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	},
	"76468": {
		"Game": {
			"Id": 76468,
			"LudopediaId": 76468,
			"Name": "Grasse: Segunda Edição",
			"IconUrl": "https://storage.googleapis.com/ludopedia-capas/76468_t.jpg",
			"LudopediaUrl": "https://ludopedia.com.br/jogo/grasse-segunda-edicao",
			"MinAmountOfPlayers": 2,
			"MaxAmountOfPlayers": 4,
			"Kind": "GAME"
		},
		"Owners": [
			{
				"AccountId": 292342,
				"AvatarUrl": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg"
			}
		]
	}
}).sort((a, b) => {
	if (a.Game.Name > b.Game.Name) {
		return 1
	} else {
		return -1
	}
})

export default function Home() {
	const [searchQuery, setSearchQuery] = useState("")
	const [activeView, setActiveView] = useState("cards")

	// Filter items based on search query
	const filteredItems = items.filter((item) => item.Game.Name.toLowerCase().includes(searchQuery.toLowerCase()))

	return (
		<main className="container mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-6">Roles & Jogos</h1>

			<div className="mb-8">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Pesquisar jogos..."
						className="pl-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<Tabs defaultValue="cards" className="mb-8">
				<TabsList>
					<TabsTrigger value="cards" onClick={() => setActiveView("cards")}>
						Cards
					</TabsTrigger>
					<TabsTrigger value="map" onClick={() => setActiveView("map")}>
						Mapa
					</TabsTrigger>
				</TabsList>

				<TabsContent value="cards" className="space-y-4 mt-4">
					{filteredItems.length > 0 ? (
						filteredItems.map((item) => (
							<Card key={item.Game.Id} className="overflow-hidden hover:shadow-md transition-shadow">
								<CardContent className="p-0">
									<div className="flex flex-row">
										<div className="flex-1 p-4 md:p-6">
											<h2 className="text-xl md:text-2xl font-bold">{item.Game.Name}</h2>
											<div className="flex flex-wrap items-center mt-2 mb-2 md:mb-4">
												<Badge variant="outline" className="mr-2 mb-1">
													{item.Game.MinAmountOfPlayers}-{item.Game.MaxAmountOfPlayers} jogadores
												</Badge>
												<a
													href={item.Game.LudopediaUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-blue-600 hover:underline"
												>
													Ver na Ludopedia
												</a>
											</div>
											<div className="flex items-center">
												<Users className="h-4 w-4 mr-2 text-muted-foreground" />
												<div className="flex">
													{item.Owners.map((person, index) => (
														<div key={index} className="relative group -ml-2 first:ml-0">
															<Image
																src={person.AvatarUrl || "/placeholder.svg"}
																alt={`Usuário ${person.AccountId}`}
																width={32}
																height={32}
																className="rounded-full border-2 border-background md:w-10 md:h-10"
															/>
															<div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
																ID: {person.AccountId}
															</div>
														</div>
													))}
												</div>
											</div>
										</div>
										<div className="w-[100px] h-[140px] md:w-[200px] md:h-[200px] relative">
											<Image
												src={item.Game.IconUrl || "/placeholder.svg"}
												alt={item.Game.Name}
												fill
												className="object-cover"
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						))
					) : (
						<div className="text-center py-10">
							<p className="text-muted-foreground">Nenhum jogo encontrado.</p>
						</div>
					)}
				</TabsContent>

				<TabsContent value="map" className="mt-4">
					<div className="rounded-lg overflow-hidden border">
						<iframe
							src="https://www.google.com/maps/d/u/0/embed?mid=1TdBj-p79GEwf-pMyPUEzDQsuuZb1ryU&ehbc=2E312F&noprof=1"
							width="100%"
							height="480"
							title="Mapa de jogos"
							className="border-0"
						></iframe>
					</div>
				</TabsContent>
			</Tabs>
		</main>
	)
}
