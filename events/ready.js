const { ActivityType } = require('discord.js');
const mariadb = require('mariadb');
const client = require('..');
const chalk = require('chalk');

require('dotenv').config();
const pool = mariadb.createPool({
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	connectionLimit: 5
});
client.pool = pool

client.on("ready", () => {
	const activities = [
		{ name: `white noise`, type: ActivityType.Listening },
		{ name: `DemocracyCraft`, type: ActivityType.Playing },
		{ name: `with the bois`, type: ActivityType.Watching },
		{ name: `the Banking Market`, type: ActivityType.Competing }
	];
	const status = [
		'online',
		'dnd'
	];
	let i = 0;
	setInterval(() => {
		if(i >= activities.length) i = 0
		client.user.setActivity(activities[i])
		i++;
	}, 5000);

	let s = 0;
	setInterval(() => {
		if(s >= activities.length) s = 0
		client.user.setStatus(status[s])
		s++;
	}, 30000);
	console.log(chalk.red(`Logged in as ${client.user.tag}!`))
});