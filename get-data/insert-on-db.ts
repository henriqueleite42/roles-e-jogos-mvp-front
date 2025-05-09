import { createWriteStream, readdirSync, readFileSync } from 'fs';
import path from 'path';
//@ts-ignore
import xid from 'xid';

function escapeString(str: string) {
	return str.replace(/'/g, "''");
}

function jsonToInsert(json: any, iconPathS: string) {
	const name = escapeString(json.Name);
	const iconPath = iconPathS ? `'${escapeString(iconPathS)}'` : 'NULL';
	const ludopediaUrl = json.LudopediaUrl ? `'${escapeString(json.LudopediaUrl)}'` : 'NULL';
	const kind = `'${json.Kind}'`;

	return `
INSERT INTO "games" (
  "name",
  "description",
  "icon_path",
  "kind",
  "ludopedia_id",
  "ludopedia_url",
  "min_amount_of_players",
  "max_amount_of_players"
) VALUES (
  '${name}',
  '',
  ${iconPath},
  ${kind},
  ${json.Id},
  ${ludopediaUrl},
  ${json.MinAmountOfPlayers},
  ${json.MaxAmountOfPlayers}
);`.trim();
}

function bootstrap() {
	const folderPath = './get-data/jogos';

	const files = readdirSync(folderPath);

	const sqlStream = createWriteStream("./get-data/games.sql")
	const csvStream = createWriteStream("./get-data/path-map.csv")

	csvStream.write(`ludopedia_id;icon_path;original_url${"\n"}`)

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const content = readFileSync(filePath, 'utf8');
		const jsonContent = JSON.parse(content)

		const iconPath = `/games/icons/${xid.generateId()}.jpg`

		csvStream.write(`${jsonContent.Id};${iconPath};${jsonContent.IconUrl}${"\n"}`)

		sqlStream.write(jsonToInsert(jsonContent, iconPath) + "\n")
	}

	sqlStream.close()
}

bootstrap()