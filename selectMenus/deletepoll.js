const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
    id: 'deletepoll_selectmenu',
    permissions: [],
    run: async (client, interaction) => {
        const db = new QuickDB({ filePath: `./data/polls.sqlite` });
        let pollID = interaction.values[0];

        // Get poll messageId & channelId from db & delete poll
        const messageId = await db.get(`${interaction.guild.id}.${pollID}.messageId`);
        const channelId = await db.get(`${interaction.guild.id}.${pollID}.channelId`);
        const channel = await client.channels.fetch(channelId);
        const message = await channel.messages.fetch(messageId);
        await message.delete();
        await db.delete(`${interaction.guild.id}.${pollID}`);

        // Delete the original message with the select menu
        await interaction.message.delete();

        // Clear poll timer
        clearTimeout(client.timers[`${pollID}`]);

        // Send & create embed
        return await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle('Poll Deleted')
                    .setDescription(`Deleted poll with id \`${pollID}\``)
                    .setColor("Green")
                    .setTimestamp()
                    .setFooter({ text: `Poll ID: ${pollID}`, iconURL: interaction.guild.iconURL() })
            ]
        });
    }
};