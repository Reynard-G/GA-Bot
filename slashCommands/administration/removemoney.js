const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Economy = require('discord-economy-super');

module.exports = {
    name: 'removemoney',
    description: "Administrator Command, removes money to a specified account.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'amount',
            description: 'Specify an amount to add.',
            required: true,
            type: ApplicationCommandOptionType.Number
        },
        {
            name: 'user',
            description: 'Specify a user to add funds too.',
            required: true,
            type: ApplicationCommandOptionType.User
        }
    ],
    run: async (client, interaction) => {
        const eco = new Economy({
            storagePath:
                `./data/eco.json`
        });
        const args = interaction.options.get('amount').value;
        const userID = interaction.options.get('user').value;
        const argumentUser = eco.users.get(userID, interaction.guild.id);

        argumentUser.balance.subtract(args);

        const removedEmbed = new EmbedBuilder()
            .setTitle('Money Removed')
            .setDescription(`Sucessfully removed **$${args}** to <@${userID}>'s balance.`)
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        return await interaction.reply({ embeds: [removedEmbed] });
    }
};