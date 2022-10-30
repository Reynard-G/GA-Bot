const { EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
    id: 'deposit_deny_image_button',
    permissions: [],
    run: async (client, interaction) => {
        let { requestEmbed, buttons, userID, id } = require("./deposit_deny");

        function attachIsImage(msgAttach) {
            const type = msgAttach.contentType;
            return (type.startsWith('image/'));
        }

        buttons.components[2].setDisabled(true);
        await interaction.update({
            embeds: [requestEmbed],
            components: [buttons]
        });

        const imageFollowUp = await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Denied Deposit Repayment')
                    .setDescription('Please send an image for proof of repayment from the denied deposit within **3** minutes.')
                    .setColor('White')
                    .setTimestamp()
                    .setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
            ]
        });

        const messageCollector = interaction.channel.createMessageCollector({ time: 180000 });
        messageCollector.on('collect', async (msg) => {
            if (msg.author.bot || msg.author.id !== interaction.user.id) return;
            if ((msg.attachments.size > 0)) {
                if (msg.attachments.every(attachIsImage)) {
                    const attachment = msg.attachments.first();
                    const url = attachment ? attachment.url : null;

                    messageCollector.stop();
                    await msg.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Denied Deposit Repayment')
                                .setDescription(`\`${id}\` has been repaid their denied deposit.`)
                                .setImage(url)
                                .setColor('Yellow')
                                .setTimestamp()
                                .setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
                        ]
                    });
                    return await client.users.cache.get(userID).send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Denied Deposit Repayment')
                                .setDescription(`You have been repaid your denied deposit.`)
                                .setImage(url)
                                .setColor('Yellow')
                                .setTimestamp()
                                .setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
                        ]
                    });
                }
                // If attachment is not image, enable the button & end collector.
                messageCollector.stop();
                buttons.components[2].setDisabled(false);
                await interaction.editReply({
                    embeds: [requestEmbed],
                    components: [buttons]
                });
                return await msg.reply({
                    ephemeral: true,
                    content: 'Some or all of the attachments sent are not images. Please send another or multiple images.'
                }).then(failMessage => {
                    setTimeout(() => { failMessage.delete(), msg.delete(), imageFollowUp.delete(); }, 5000);
                });
            }
        });
        messageCollector.on('end', async (collected, reason) => {
            if (reason == 'time') {
                imageFollowUp.delete();
                buttons.components[2].setDisabled(false);
                return await interaction.editReply({
                    embeds: [requestEmbed],
                    components: [buttons]
                });
            }
        });
    }
};
