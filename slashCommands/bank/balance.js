const { EmbedBuilder, ApplicationCommandType } = require('discord.js');
const Economy = require('discord-economy-super');

module.exports = {
    name: 'balance',
    description: "See your current balance",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        const eco = new Economy({
            storagePath:
                `./data/eco.json`
        });
        const argumentUser = eco.users.get(interaction.user.id, interaction.guild.id);
        const balance = argumentUser.balance.get();

        const balanceEmbed = new EmbedBuilder()
            .setTitle('Balance')
            .setDescription(`You currently have **$${balance}** in your account!`)
            .setColor('White')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        return await interaction.reply({ embeds: [balanceEmbed] });
    }
};