import fs from "fs"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let crud = {}

fs.readdirSync(`${__dirname}`).forEach(async file => {
    let filename = file.split(".")
    try {
        if (filename[1] == "js" && filename[0] != "index") {
            crud[filename[0]] = await import(`./${file}`)
        }
    } catch (error) {
        console.error(error)
    }
})

export default crud