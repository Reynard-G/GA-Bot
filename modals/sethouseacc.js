const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    id: 'sethouseacc_modal',
    permissions: [],
    run: async (client, interaction) => {
        let { id } = require('../events/interactionModal');
        const db = new QuickDB({ filePath: `./data/settings.sqlite` });
        await db.set(`${interaction.guild.id}.houseAccount`, id);

        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('House Account Set')
                    .setDescription(`The house account has been set to \`${id}\`.`)
                    .setColor('Green')
                    .setTimestamp()
                    .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() })
            ]
        });
    }
};