const cron = require('node-cron');
const client = require('..');
const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");

cron.schedule('0 0 1 * *', async () => { // Runs every first day of the month at 12AM CST (UTC-6) 
    const db = new QuickDB({ filePath: `./data/interest.sqlite` });
    let dbdata = await db.all();

    // Get Guild IDs
    let guildIDArr = [];
    for (let i = 0; i < dbdata.length; i++) {
        guildIDArr.push(dbdata[i].id);
    }
    console.log(guildIDArr);

    // Get User IDs
    let userIDArr = [];
    for (let i = 0; i < dbdata.length; i++) {
        userIDArr.push(Object.keys(dbdata[i].value).filter(Number));
    }
    console.log(userIDArr);

    // Get server interest rates
    let interestPercentageArr = [];
    let interestConstantArr = [];
    for (let i = 0; i < dbdata.length; i++) {
        for (let j = 0; j < userIDArr[i].length; j++) {
            interestPercentageArr.push(dbdata[i].value[userIDArr[i][j]].rate.percentage);
            interestConstantArr.push(dbdata[i].value[userIDArr[i][j]].rate.constant);
        }
    }
    console.log(interestPercentageArr);
    console.log(interestConstantArr);

    // Get all Balances
    let balances = [];
    const ecoDatabase = client.eco.database.all();
    for (let i = 0; i < Object.keys(ecoDatabase).length; i++) {
        for (let j = 0; j < Object.keys(ecoDatabase[guildIDArr[i]]).length; j++) {
            balances.push(ecoDatabase[guildIDArr[i]][userIDArr[i][j]].money);
        }
    }
    console.log(balances);

    // Apply interest rates to balances
    for (let i = 0; i < balances.length; i++) {
        // Apply percentage first
        balances[i] *= (1 + (interestPercentageArr[i] / 100));
        // Apply constant second
        balances[i] += interestConstantArr[i];
        balances[i] = +(Math.round(balances[i] + "e+2") + "e-2");
    }
    console.log(balances);

    // Get ArgumentUsers
    const argumentUserArr = [];
    let argumentUser;
    for (let i = 0; i < Object.keys(ecoDatabase).length; i++) {
        for (let j = 0; j < Object.keys(ecoDatabase[guildIDArr[i]]).length; j++) {
            argumentUser = client.eco.users.get(`${userIDArr[i][j]}`, `${guildIDArr[i]}`);
            argumentUserArr.push(argumentUser);
        }
    }

    // Set balances to argument users
    for (let i = 0; i < argumentUserArr.length ?? balances.length; i++) {
        console.log(argumentUserArr[i].id);
        argumentUserArr[i].balance.set(balances[i]);
    }

    // Get channel IDs to send interaction notifications too
    const guildChannelIDs = [];
    for (let i = 0; i < Object.keys(dbdata).length; i++) {
        if (dbdata[i].value.channelID) {
            guildChannelIDs.push({ guildID: dbdata[i].id, channelID: dbdata[i].value.channelID.interestChannelID });
        } else {
            guildChannelIDs.push({ guildID: dbdata[i].id, channelID: null });
        }
    }
    console.log(guildChannelIDs);

    // Retrieve channel using channelIDs and send interaction notifications
    for (let i = 0; i < guildChannelIDs.length; i++) {
        const guild = client.guilds.cache.get(guildChannelIDs[i].guildID);
        const channel = client.channels.cache.get(guildChannelIDs[i].channelID) ?? client.users.cache.get(guild.ownerId);

        const interestEmbed = new EmbedBuilder()
            .setTitle('Interest')
            .setDescription(`Interest has been applied to all users in this server.`)
            .setColor('Yellow')
            .setTimestamp()
            .setFooter({ text: `${guildChannelIDs[i].guildID} `, iconURL: guild.iconURL() });

        channel.send({ embeds: [interestEmbed] });
    }
}, {
    scheduled: true,
    timezone: "America/Chicago"
});