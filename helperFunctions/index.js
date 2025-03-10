const fs = require('fs');
let modules = {}

fs.readdirSync(`${__dirname}`).forEach(file => {
    let filename = file.split(".")
    try {
        if (filename[1] == "js" && filename[0] != "index") {
            crud[filename[0]] = require(`${__dirname}/${file}`)
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = modules