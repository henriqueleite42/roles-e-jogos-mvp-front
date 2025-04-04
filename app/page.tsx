"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import Image from "next/image"

// Sample data for our items
const items = Object.values({
	"70": {
		"id": 70,
		"url": "https://ludopedia.com.br/jogo/village",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Village",
		"image": "https://storage.googleapis.com/ludopedia-capas/70_t.jpg"
	},
	"71": {
		"id": 71,
		"url": "https://ludopedia.com.br/jogo/zombicide",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Zombicide",
		"image": "https://storage.googleapis.com/ludopedia-capas/71_t.jpg"
	},
	"333": {
		"id": 333,
		"url": "https://ludopedia.com.br/jogo/fungi-morels",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Fungi",
		"image": "https://storage.googleapis.com/ludopedia-capas/333_t.jpg"
	},
	"397": {
		"id": 397,
		"url": "https://ludopedia.com.br/jogo/catan-the-settlers-of-catan",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Catan: O Jogo",
		"image": "https://storage.googleapis.com/ludopedia-capas/397_t.jpg"
	},
	"612": {
		"id": 612,
		"url": "https://ludopedia.com.br/jogo/dixit-odyssey",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Dixit: Odyssey",
		"image": "https://storage.googleapis.com/ludopedia-capas/612_t.jpg"
	},
	"618": {
		"id": 618,
		"url": "https://ludopedia.com.br/jogo/uno",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Uno",
		"image": "https://storage.googleapis.com/ludopedia-capas/618_t.jpg"
	},
	"772": {
		"id": 772,
		"url": "https://ludopedia.com.br/jogo/alhambra",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Alhambra",
		"image": "https://storage.googleapis.com/ludopedia-capas/772_t.jpg"
	},
	"1041": {
		"id": 1041,
		"url": "https://ludopedia.com.br/jogo/dominoes",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Dominó",
		"image": "https://storage.googleapis.com/ludopedia-capas/1041_t.jpg"
	},
	"1261": {
		"id": 1261,
		"url": "https://ludopedia.com.br/jogo/jaipur",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Jaipur",
		"image": "https://storage.googleapis.com/ludopedia-capas/1261_t.jpg"
	},
	"1896": {
		"id": 1896,
		"url": "https://ludopedia.com.br/jogo/abalone-polaris",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Abalone / Polaris",
		"image": "https://storage.googleapis.com/ludopedia-capas/1896_t.jpg"
	},
	"3857": {
		"id": 3857,
		"url": "https://ludopedia.com.br/jogo/dobble-spot-it",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Dobble",
		"image": "https://storage.googleapis.com/ludopedia-capas/3857_t.jpg"
	},
	"3952": {
		"id": 3952,
		"url": "https://ludopedia.com.br/jogo/uno-stacko",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "UNO Stacko",
		"image": "https://storage.googleapis.com/ludopedia-capas/3952_t.jpg"
	},
	"4699": {
		"id": 4699,
		"url": "https://ludopedia.com.br/jogo/la-granja",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "La Granja",
		"image": "https://storage.googleapis.com/ludopedia-capas/4699_t.jpg"
	},
	"11466": {
		"id": 11466,
		"url": "https://ludopedia.com.br/jogo/black-stories-3",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Histórias Sinistras 3",
		"image": "https://storage.googleapis.com/ludopedia-capas/11466_t.jpg"
	},
	"15400": {
		"id": 15400,
		"url": "https://ludopedia.com.br/jogo/bandido",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Bandido",
		"image": "https://storage.googleapis.com/ludopedia-capas/15400_t.jpg"
	},
	"15752": {
		"id": 15752,
		"url": "https://ludopedia.com.br/jogo/hora-de-aventuras-juego-de-rol-rpg",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Hora de Aventura: Roleplaying Game",
		"image": "https://storage.googleapis.com/ludopedia-capas/15752_t.jpg"
	},
	"17305": {
		"id": 17305,
		"url": "https://ludopedia.com.br/jogo/the-mind",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "The Mind",
		"image": "https://storage.googleapis.com/ludopedia-capas/17305_t.jpg"
	},
	"17906": {
		"id": 17906,
		"url": "https://ludopedia.com.br/jogo/gizmos",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Gizmos",
		"image": "https://storage.googleapis.com/ludopedia-capas/17906_t.jpg"
	},
	"18135": {
		"id": 18135,
		"url": "https://ludopedia.com.br/jogo/claim-2",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Claim 2",
		"image": "https://storage.googleapis.com/ludopedia-capas/18135_t.jpg"
	},
	"18993": {
		"id": 18993,
		"url": "https://ludopedia.com.br/jogo/barrage",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Barrage",
		"image": "https://storage.googleapis.com/ludopedia-capas/18993_t.jpg"
	},
	"19973": {
		"id": 19973,
		"url": "https://ludopedia.com.br/jogo/q-death-on-4th-of-july",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Elementar: Morte em 4 de Julho",
		"image": "https://storage.googleapis.com/ludopedia-capas/19973_t.jpg"
	},
	"19974": {
		"id": 19974,
		"url": "https://ludopedia.com.br/jogo/sherlock-last-call",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Elementar: Última Chamada",
		"image": "https://storage.googleapis.com/ludopedia-capas/19974_t.jpg"
	},
	"19975": {
		"id": 19975,
		"url": "https://ludopedia.com.br/jogo/q-tomb-of-the-archaeologist",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Elementar: A Tumba do Arqueólogo",
		"image": "https://storage.googleapis.com/ludopedia-capas/19975_t.jpg"
	},
	"20870": {
		"id": 20870,
		"url": "https://ludopedia.com.br/jogo/-l-l-a-m-a",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "LHAMA",
		"image": "https://storage.googleapis.com/ludopedia-capas/20870_t.jpg"
	},
	"21817": {
		"id": 21817,
		"url": "https://ludopedia.com.br/jogo/carnival-zombie-second-edition",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Carnival Zombie (Segunda Edição)",
		"image": "https://storage.googleapis.com/ludopedia-capas/21817_t.jpg"
	},
	"23152": {
		"id": 23152,
		"url": "https://ludopedia.com.br/jogo/banco-imobiliario-mundo",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Banco Imobiliário Mundo",
		"image": "https://storage.googleapis.com/ludopedia-capas/23152_t.jpg"
	},
	"23156": {
		"id": 23156,
		"url": "https://ludopedia.com.br/jogo/cafe",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Café",
		"image": "https://storage.googleapis.com/ludopedia-capas/23156_t.jpg"
	},
	"23331": {
		"id": 23331,
		"url": "https://ludopedia.com.br/jogo/super-cats",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Super Cats",
		"image": "https://storage.googleapis.com/ludopedia-capas/23331_t.jpg"
	},
	"24032": {
		"id": 24032,
		"url": "https://ludopedia.com.br/jogo/telma-2-edicao",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Telma (2ª Edição)",
		"image": "https://storage.googleapis.com/ludopedia-capas/24032_t.jpg"
	},
	"24141": {
		"id": 24141,
		"url": "https://ludopedia.com.br/jogo/golem",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Golem",
		"image": "https://storage.googleapis.com/ludopedia-capas/24141_t.jpg"
	},
	"24269": {
		"id": 24269,
		"url": "https://ludopedia.com.br/jogo/taco-cat-goat-cheese-pizza",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Taco Gato Cabra Queijo Pizza",
		"image": "https://storage.googleapis.com/ludopedia-capas/24269_t.jpg"
	},
	"24635": {
		"id": 24635,
		"url": "https://ludopedia.com.br/jogo/vampiro-sozinho-na-escuridao",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Vampiro - Sozinho na Escuridão",
		"image": "https://storage.googleapis.com/ludopedia-capas/24635_t.jpg"
	},
	"25925": {
		"id": 25925,
		"url": "https://ludopedia.com.br/jogo/flourish",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Flourish",
		"image": "https://storage.googleapis.com/ludopedia-capas/25925_t.jpg"
	},
	"26076": {
		"id": 26076,
		"url": "https://ludopedia.com.br/jogo/a-heranca-de-cthulhu",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "A Herança de Cthulhu",
		"image": "https://storage.googleapis.com/ludopedia-capas/26076_t.jpg"
	},
	"26078": {
		"id": 26078,
		"url": "https://ludopedia.com.br/jogo/frostpunk-the-board-game",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Frostpunk: The Board Game",
		"image": "https://storage.googleapis.com/ludopedia-capas/26078_t.jpg"
	},
	"26234": {
		"id": 26234,
		"url": "https://ludopedia.com.br/jogo/mysterium-park",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Mysterium Park",
		"image": "https://storage.googleapis.com/ludopedia-capas/26234_t.jpg"
	},
	"26473": {
		"id": 26473,
		"url": "https://ludopedia.com.br/jogo/canvas",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Canvas",
		"image": "https://storage.googleapis.com/ludopedia-capas/26473_t.jpg"
	},
	"26753": {
		"id": 26753,
		"url": "https://ludopedia.com.br/jogo/3-jogos-ludo-dama-trilha",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "3 Jogos: Ludo, Dama, Trilha",
		"image": "https://storage.googleapis.com/ludopedia-capas/26753_t.jpg"
	},
	"29051": {
		"id": 29051,
		"url": "https://ludopedia.com.br/jogo/pandemic-hot-zone-europe",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Pandemic: Zona Crítica - Europa",
		"image": "https://storage.googleapis.com/ludopedia-capas/29051_t.jpg"
	},
	"31085": {
		"id": 31085,
		"url": "https://ludopedia.com.br/jogo/glow",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Lume",
		"image": "https://storage.googleapis.com/ludopedia-capas/31085_t.jpg"
	},
	"31177": {
		"id": 31177,
		"url": "https://ludopedia.com.br/jogo/monopoly-bid",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Monopoly: Bid",
		"image": "https://storage.googleapis.com/ludopedia-capas/31177_t.jpg"
	},
	"31428": {
		"id": 31428,
		"url": "https://ludopedia.com.br/jogo/city-of-mist-player-s-guide",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "City of Mist: Guia do Jogador",
		"image": "https://storage.googleapis.com/ludopedia-capas/31428_t.jpg"
	},
	"32443": {
		"id": 32443,
		"url": "https://ludopedia.com.br/jogo/licantropo-maldicao-de-sangue",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Licantropo - Maldição de Sangue",
		"image": "https://storage.googleapis.com/ludopedia-capas/32443_t.jpg"
	},
	"32444": {
		"id": 32444,
		"url": "https://ludopedia.com.br/jogo/bruxo-pacto-das-sombras",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Bruxo - Pacto das Sombras",
		"image": "https://storage.googleapis.com/ludopedia-capas/32444_t.jpg"
	},
	"32453": {
		"id": 32453,
		"url": "https://ludopedia.com.br/jogo/savage",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Savage",
		"image": "https://storage.googleapis.com/ludopedia-capas/32453_t.jpg"
	},
	"33333": {
		"id": 33333,
		"url": "https://ludopedia.com.br/jogo/tindaya",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Tindaya",
		"image": "https://storage.googleapis.com/ludopedia-capas/33333_t.jpg"
	},
	"34618": {
		"id": 34618,
		"url": "https://ludopedia.com.br/jogo/as-7-baladas-do-oeste",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "As 7 Baladas do Oeste",
		"image": "https://storage.googleapis.com/ludopedia-capas/34618_t.jpg"
	},
	"35117": {
		"id": 35117,
		"url": "https://ludopedia.com.br/jogo/santa-kaos",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Santa Kaos",
		"image": "https://storage.googleapis.com/ludopedia-capas/35117_t.jpg"
	},
	"35122": {
		"id": 35122,
		"url": "https://ludopedia.com.br/jogo/uno-all-wild",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "UNO: All Wild!",
		"image": "https://storage.googleapis.com/ludopedia-capas/35122_t.jpg"
	},
	"35130": {
		"id": 35130,
		"url": "https://ludopedia.com.br/jogo/alieninjas",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Alieninjas",
		"image": "https://storage.googleapis.com/ludopedia-capas/35130_t.jpg"
	},
	"36508": {
		"id": 36508,
		"url": "https://ludopedia.com.br/jogo/four-against-darkness-four-against-the-great-old-ones",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Four Against Darkness: Contra os Grandes Antigos",
		"image": "https://storage.googleapis.com/ludopedia-capas/36508_t.jpg"
	},
	"36562": {
		"id": 36562,
		"url": "https://ludopedia.com.br/jogo/oh-my-brain",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Oh My Brain",
		"image": "https://storage.googleapis.com/ludopedia-capas/36562_t.jpg"
	},
	"40988": {
		"id": 40988,
		"url": "https://ludopedia.com.br/jogo/ferias-em-dupla",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Férias em Dupla",
		"image": "https://storage.googleapis.com/ludopedia-capas/40988_t.jpg"
	},
	"52242": {
		"id": 52242,
		"url": "https://ludopedia.com.br/jogo/zurvivors-origem",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Zurvivors Origem",
		"image": "https://storage.googleapis.com/ludopedia-capas/52242_t.jpg"
	},
	"52818": {
		"id": 52818,
		"url": "https://ludopedia.com.br/jogo/quartz-o-jogo-de-cartas",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Quartz: O Jogo de Cartas",
		"image": "https://storage.googleapis.com/ludopedia-capas/52818_t.jpg"
	},
	"53216": {
		"id": 53216,
		"url": "https://ludopedia.com.br/jogo/trolls-and-princesses",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Trolls e Princesas",
		"image": "https://storage.googleapis.com/ludopedia-capas/53216_t.jpg"
	},
	"53927": {
		"id": 53927,
		"url": "https://ludopedia.com.br/jogo/chule",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Chulé",
		"image": "https://storage.googleapis.com/ludopedia-capas/53927_t.jpg"
	},
	"58247": {
		"id": 58247,
		"url": "https://ludopedia.com.br/jogo/fuga-do-sanatorio-moreau",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Fuga do Sanatório Moreau",
		"image": "https://storage.googleapis.com/ludopedia-capas/58247_t.jpg"
	},
	"66307": {
		"id": 66307,
		"url": "https://ludopedia.com.br/jogo/rolling-ranch-celeiros-rebanhos",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Rolling Ranch: Celeiros & Rebanhos",
		"image": "https://storage.googleapis.com/ludopedia-capas/66307_t.jpg"
	},
	"66725": {
		"id": 66725,
		"url": "https://ludopedia.com.br/jogo/candela-obscura",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Candela Obscura",
		"image": "https://storage.googleapis.com/ludopedia-capas/66725_t.jpg"
	},
	"66840": {
		"id": 66840,
		"url": "https://ludopedia.com.br/jogo/azul-summer-pavilion-mini",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Azul Mini: Pavilhão de Verão",
		"image": "https://storage.googleapis.com/ludopedia-capas/66840_t.jpg"
	},
	"67134": {
		"id": 67134,
		"url": "https://ludopedia.com.br/jogo/balaio-de-gato",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Balaio de Gato",
		"image": "https://storage.googleapis.com/ludopedia-capas/67134_t.jpg"
	},
	"69678": {
		"id": 69678,
		"url": "https://ludopedia.com.br/jogo/wilderfeast",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Wilderfeast",
		"image": "https://storage.googleapis.com/ludopedia-capas/69678_t.jpg"
	},
	"76468": {
		"id": 76468,
		"url": "https://ludopedia.com.br/jogo/grasse-segunda-edicao",
		"persons": [
			{
				"avatar": "https://ludopedia.com.br/uploads/avatar/avatar_292342_1735170383.jpg",
				"id": 292342,
				"name": "henriqueleite42"
			}
		],
		"title": "Grasse: Segunda Edição",
		"image": "https://storage.googleapis.com/ludopedia-capas/76468_t.jpg"
	}
})

export default function Home() {
	const [searchQuery, setSearchQuery] = useState("")

	// Filter items based on search query
	const filteredItems = items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

	return (
		<main className="container mx-auto py-8 px-4">
			<div className="mb-8">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search by title..."
						className="pl-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<div className="space-y-4">
				{filteredItems.length > 0 ? (
					filteredItems.map((item) => (
						<Card key={item.id} className="overflow-hidden">
							<CardContent className="p-0">
								<div className="flex flex-col md:flex-row">
									<div className="flex-1 p-6">
										<h2 className="text-2xl font-bold">{item.title}</h2>
										{/* <div className="flex items-center mt-2 mb-4">
											<div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
												{item.rating.toFixed(1)}
											</div>
										</div> */}
										<div className="flex">
											{item.persons.map((person, index) => (
												<div key={index} className="relative group mr-1">
													<Image
														src={person.avatar}
														alt={person.name}
														width={40}
														height={40}
														className="rounded-full border-2 border-background"
													/>
													<div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
														{person.name}
													</div>
												</div>
											))}
										</div>
									</div>
									<div className="md:w-[300px] h-[200px] relative">
										<Image src={item.image} alt={item.title} fill className="object-cover" />
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
			</div>

			<div className="space-y-4 mt-8 flex justify-center">
				<iframe src="https://www.google.com/maps/d/u/0/embed?mid=1TdBj-p79GEwf-pMyPUEzDQsuuZb1ryU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe>
			</div>
		</main>
	)
}

