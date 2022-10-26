const { EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
    id: 'withdraw_approve_image_button',
    permissions: [],
    run: async (client, interaction) => {
        let { requestEmbed, buttons, userID } = require("./withdraw_approve");
        const db = new QuickDB({ filePath: `./data/roles.sqlite` });
        const buttonUser = await interaction.guild.members.cache.get(interaction.user.id);
        const bankerRole = await db.get(`${interaction.guild.id}.bankerRole`) ?? null;

        function attachIsImage(msgAttach) {
            const type = msgAttach.contentType;
            return (type.startsWith('image/'));
        }

        if (!buttonUser.roles.cache.has(bankerRole)) {
            const permEmbed = new EmbedBuilder()
                .setTitle('Insufficient Permissions')
                .setDescription(`You have insufficient permissions due to not having the <@&${bankerRole}> role.`)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [permEmbed], ephemeral: true });
        }

        buttons.components[2].setDisabled(true);
        await interaction.update({ embeds: [requestEmbed], components: [buttons] });

        const imageEmbed = new EmbedBuilder()
            .setTitle('Approved Withdrawal Payment')
            .setDescription('Please send an image for proof of payment from the approved withdraw within **3** minutes.')
            .setColor('White')
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

        const imageFollowUp = await interaction.followUp({ embeds: [imageEmbed] });

        const messageCollector = interaction.channel.createMessageCollector({ time: 180000 });
        messageCollector.on('collect', async (msg) => {
            if (msg.author.bot || msg.author.id !== interaction.user.id) return;
            if ((msg.attachments.size > 0)) {
                if (msg.attachments.every(attachIsImage)) {
                    const attachment = msg.attachments.first();
                    const url = attachment ? attachment.url : null;

                    const dmEmbed = new EmbedBuilder()
                        .setTitle('Approved Withdraw Payment')
                        .setDescription(`You have been paid you approved withdrawal.`)
                        .setImage(url)
                        .setColor('Green')
                        .setTimestamp()
                        .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

                    const confirmedEmbed = new EmbedBuilder()
                        .setTitle('Approved Withdraw Payment')
                        .setDescription(`<@${userID}> has been paid your approved withdrawal.`)
                        .setImage(url)
                        .setColor('Green')
                        .setTimestamp()
                        .setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

                    messageCollector.stop();
                    await msg.reply({ embeds: [confirmedEmbed] });
                    return await client.users.cache.get(userID).send({ embeds: [dmEmbed] });
                }
                // If attachment is not image, enable the button & end collector.
                messageCollector.stop();
                buttons.components[2].setDisabled(false);
                await interaction.editReply({ embeds: [requestEmbed], components: [buttons] });
                return await msg.reply({ content: 'Some or all of the attachments sent are not images. Please send another or multiple images.', ephemeral: true }).then(failMessage => {
                    setTimeout(() => { failMessage.delete(), msg.delete(), imageFollowUp.delete(); }, 5000);
                });
            }
        });
        messageCollector.on('end', async (collected, reason) => {
            if (reason == 'time') {
                imageFollowUp.delete();
                buttons.components[2].setDisabled(false);
                return await interaction.editReply({ embeds: [requestEmbed], components: [buttons] });
            }
        });
    }
};
