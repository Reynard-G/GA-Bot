const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    name: 'setbankerrole',
    description: "Set which role will have the permissions to accept/deny deposit & loan requests",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'Administrator',
    options: [
        {
            name: 'role',
            description: 'Specify which role to be the Banker role.',
            type: ApplicationCommandOptionType.Role,
            required: true
        }
    ],
    run: async (client, interaction) => {
        const db = new QuickDB({ filePath: `./data/roles.sqlite` });
        const roleID = interaction.options.get('role').value;

        db.set(`${interaction.guild.id}`, { bankerRole: `${roleID}` });

        const successEmbed = new EmbedBuilder()
            .setTitle('Set Banker Role')
            .setDescription(`Sucessfully set the banker role to be <@&${roleID}>`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [successEmbed] });
    }
};
