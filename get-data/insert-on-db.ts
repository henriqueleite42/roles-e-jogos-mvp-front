import {
	createWriteStream,
	readdirSync,
	readFileSync,
	existsSync,
	mkdirSync,
} from 'fs';
import path from 'path';
import { default as axios } from 'axios';
import { promisify } from 'util';
import { pipeline } from 'stream';
//@ts-ignore
import xid from 'xid';

const streamPipeline = promisify(pipeline);

function sleep(s: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, s * 1000));
}

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

async function downloadImage(url: string, destPath: string): Promise<void> {
	const response = await axios.get(url, { responseType: 'stream' });
	const writer = createWriteStream(destPath);
	await streamPipeline(response.data, writer);
}

async function bootstrap() {
	const folderPath = './get-data/jogos';
	const outputFolder = './get-data/images';

	if (!existsSync(folderPath)) {
		mkdirSync(folderPath, { recursive: true });
	}
	if (!existsSync(outputFolder)) {
		mkdirSync(outputFolder, { recursive: true });
	}

	const files = readdirSync(folderPath);
	const sqlStream = createWriteStream('./get-data/games.sql');
	const csvStream = createWriteStream('./get-data/path-map.csv');
	csvStream.write(`ludopedia_id;icon_path;original_url\n`);

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const content = readFileSync(filePath, 'utf8');
		const jsonContent = JSON.parse(content);

		const iconPath = `/games/icons/${xid.generateId()}.jpg`;
		const imageFilename = `${jsonContent.Id}.jpg`;
		const imagePath = path.join(outputFolder, imageFilename);

		if (!existsSync(imagePath)) {
			try {
				await downloadImage(jsonContent.IconUrl, imagePath);
				console.log(`Downloaded image for ${jsonContent.Name}`);
			} catch (err) {
				//@ts-ignore
				throw new Error(`Failed to download image for ID ${jsonContent.Id}: ${err.message}`);
			}
			await sleep(1)
		}

		csvStream.write(`${jsonContent.Id};${iconPath};${jsonContent.IconUrl}\n`);
		sqlStream.write(jsonToInsert(jsonContent, iconPath) + '\n');
	}

	sqlStream.close();
	csvStream.close();
}

bootstrap().catch(console.error);
