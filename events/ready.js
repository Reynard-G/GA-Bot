const { ActivityType } = require('discord.js');
const Economy = require('discord-economy-super');
const client = require('..');
const chalk = require('chalk');

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

let economy = new Economy({
	storagePath: `./data/eco.json`
});

economy.on('ready', eco => {
	client.eco = eco;
});