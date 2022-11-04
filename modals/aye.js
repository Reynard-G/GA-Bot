const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
    id: 'aye_modal',
    permissions: [],
    run: async (client, interaction) => {
        let { id, balance } = require('../events/interactionModal');
        let { pollEmbed, pollButtons, pollId } = require("./createpoll");
        const shares = balance / 100;

        const db = new QuickDB({ filePath: `./data/polls.sqlite` });
        let ayeCount = (await db.get(`${interaction.guild.id}.${pollId}.aye.count`));
        let ayeUsers = (await db.get(`${interaction.guild.id}.${pollId}.aye.users`));
        let nayCount = (await db.get(`${interaction.guild.id}.${pollId}.nay.count`));
        let nayUsers = (await db.get(`${interaction.guild.id}.${pollId}.nay.users`));

        // Check if user has already voted
        // If so, remove their vote and change it to current vote
        if (nayUsers.includes(id)) {
            await db.set(`${interaction.guild.id}.${pollId}.aye.count`, ayeCount + shares);
            await db.set(`${interaction.guild.id}.${pollId}.nay.count`, nayCount - shares);
            await db.set(`${interaction.guild.id}.${pollId}.aye.users`, [...ayeUsers, id]);
            await db.set(`${interaction.guild.id}.${pollId}.nay.users`, nayUsers.filter((user) => user != id));
            ayeCount = (await db.get(`${interaction.guild.id}.${pollId}.aye.count`));
            nayCount = (await db.get(`${interaction.guild.id}.${pollId}.nay.count`));

            pollEmbed.data.fields[0] = { name: `Aye: `, value: `${ayeCount} shares (${(((ayeCount) / (ayeCount + nayCount)) * 100).toFixed(2)}%)`, inline: true };
            pollEmbed.data.fields[1] = { name: `Nay: `, value: `${nayCount} shares (${(((nayCount) / (ayeCount + nayCount)) * 100).toFixed(2)}%)`, inline: true };

            return await interaction.update({
                embeds: [pollEmbed],
                components: [pollButtons]
            });
        } else if (ayeUsers.includes(id)) {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle("You have already voted!")
                        .setDescription("You cannot vote twice on the same poll.")
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                ]
            });
        }

        // If not, add their vote
        await db.set(`${interaction.guild.id}.${pollId}.aye.count`, ayeCount + shares);
        await db.set(`${interaction.guild.id}.${pollId}.aye.users`, [...ayeUsers, id]);
        ayeCount = (await db.get(`${interaction.guild.id}.${pollId}.aye.count`));
        nayCount = (await db.get(`${interaction.guild.id}.${pollId}.nay.count`));

        pollEmbed.data.fields[0] = { name: `Aye: `, value: `${ayeCount} shares (${(((ayeCount) / (ayeCount + nayCount)) * 100).toFixed(2)}%)`, inline: true };
        pollEmbed.data.fields[1] = { name: `Nay: `, value: `${nayCount} shares (${(((nayCount) / (ayeCount + nayCount)) * 100).toFixed(2)}%)`, inline: true };

        return await interaction.update({
            embeds: [pollEmbed],
            components: [pollButtons]
        });
    }
};