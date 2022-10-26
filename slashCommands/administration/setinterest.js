const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'setinterest',
    description: "Set the interest channel to be notified when interest is applied to accounts.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'channel',
            description: 'Specify which channel interest notifications will go.',
            required: true,
            type: ApplicationCommandOptionType.Channel
        }
    ],
    run: async (client, interaction) => {
        const channel = interaction.options.getChannel('channel');
        if (channel.type != '0' && channel.type != '6') {
            const invalidChannelEmbed = new EmbedBuilder()
                .setTitle('Invalid Channel')
                .setDescription(`You must specify a text channel!`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [invalidChannelEmbed], ephemeral: true });
        }

        const db = new QuickDB({ filePath: `./data/interest.sqlite` });
        await db.set(`${interaction.guild.id}.channelID`, { interestChannelID: `${channel.id}` });

        const setupEmbed = new EmbedBuilder()
            .setTitle('Interest Channel Setup')
            .setDescription(`Sucessfully set interest notifications channel in **${interaction.guild.name}** to be ${channel}`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        return await interaction.reply({ embeds: [setupEmbed] });
    }
};