const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'removemoney',
    description: "Administrator Command, removes money to a specified account.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'Administrator',
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
        const args = interaction.options.get('amount').value;
        const userID = interaction.options.get('user').value;
        const argumentUser = client.eco.users.get(userID, interaction.guild.id);

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