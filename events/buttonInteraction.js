const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { QuickDB } = require("quick.db");
const client = require('..');

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const button = client.buttons.get(interaction.customId);
    if (!button) return;

    try {
        if (button.permissions) {
            if (!interaction.memberPermissions.has(PermissionsBitField.resolve(button.permissions || []))) {
                const perms = new EmbedBuilder()
                    .setDescription(`🚫 ${interaction.user}, You don't have \`${button.permissions}\` permissions to interact this button!`)
                    .setColor('Red');
                return interaction.reply({ embeds: [perms], ephemeral: true });
            }
        }
        let db = new QuickDB({ filePath: `./data/roles.sqlite` });
        const buttonUser = await interaction.guild.members.cache.get(interaction.user.id);
        const bankerRole = await db.get(`${interaction.guild.id}.bankerRole`) ?? undefined;

        if (!buttonUser.roles.cache.has(bankerRole) && !buttonUser.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Insufficient Permissions')
                        .setDescription(`You have insufficient permissions due to not having the <@&${bankerRole}> role.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() })
                ]
            });
        } else {
            await button.run(client, interaction);
        }
    } catch (error) {
        console.log(error);
    }
});
