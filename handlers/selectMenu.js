const fs = require('fs');
const chalk = require('chalk')
var AsciiTable = require('ascii-table');
var table = new AsciiTable()
table.setHeading('Select Menus', 'Stats').setBorder('|', '=', "0", "0")

module.exports = (client) => {
    fs.readdirSync('./selectMenus/').filter((file) => file.endsWith('.js')).forEach((file) => {
        const selectMenu = require(`../selectMenus/${file}`)
        client.selectMenus.set(selectMenu.id, selectMenu)
		table.addRow(selectMenu.id, '✅')
    })
		console.log(chalk.yellow(table.toString()))
};
