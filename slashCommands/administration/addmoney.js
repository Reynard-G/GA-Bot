const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'addmoney',
    description: "Administrator Command, adds money to a specified account.",
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
        const guildID = interaction.guild.id;
        const args = interaction.options.get('amount').value;
        const userID = interaction.options.get('user').value;
        let argumentUser = client.eco.users.get(userID, guildID);

        argumentUser.balance.add(args);

        const addedEmbed = new EmbedBuilder()
            .setTitle('Money Added')
            .setDescription(`Sucessfully added **$${args}** to <@${userID}>'s balance.`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        return await interaction.reply({ embeds: [addedEmbed] });
    }
};