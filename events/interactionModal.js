const { EmbedBuilder, Collection, InteractionType } = require('discord.js');
const ms = require('ms');
const client = require('..');
const cooldown = new Collection();

client.on('interactionCreate', async interaction => {
    try {
        //=====================================| Command Handling |=====================================\\
        if (interaction.isModalSubmit()) {
            if (!interaction.guild) {
                await interaction.reply({
                    ephemeral: true,
                    content: `You do not have to use this modal in DMs!`
                });
            }
            if (interaction.user.bot) return;

            if (interaction.type !== InteractionType.ModalSubmit) return;
            const command = client.modals.get(interaction.customId);
            if (!command) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle(`Failed To Execute Modals!`)
                            .setDescription(`I can\'t execute the modal for you.`)
                            .setTimestamp()
                            .setFooter({ text: `FAILED MODAL`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }

            // ====================< Start Command >=================== \\
            try {

                if (interaction.customId != 'createpoll_modal') {

                    const id = interaction.fields.getTextInputValue('idInput');
                    const passphrase = interaction.fields.getTextInputValue('passphraseInput');
                    const conn = await client.pool.getConnection();;
                    const exists = await conn.query(`SELECT EXISTS(SELECT * FROM eco WHERE id='${id}' AND passphrase='${passphrase}');`);

                    if (exists[0][`EXISTS(SELECT * FROM eco WHERE id='${id}' AND passphrase='${passphrase}')`] == 0) {
                        await interaction.reply({
                            ephemeral: true,
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Invalid Credentials')
                                    .setDescription(`The credentials you entered are invalid. Please try again.`)
                                    .setColor('Red')
                                    .setTimestamp()
                                    .setFooter({ text: `INVALID CREDENTIALS`, iconURL: interaction.guild.iconURL() })
                            ]
                        });
                        conn.release();
                    } else {
                        let balance = (await conn.query(`SELECT balance FROM eco WHERE id='${id}';`))[0].balance;
                        console.log(`${id} (Balance: $${balance}) ran ${command.id} `);
                        module.exports = { id, passphrase, balance };
                        await command.run(client, interaction);
                    }
                } else {
                    console.log(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) ran ${command.id}`);
                    await command.run(client, interaction);
                }
            } catch (error) {
                console.log(error);
                await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Failed To Execute Modals!')
                            .setDescription(`There was an error trying to execute that modal!`)
                            .addFields(`Error`, `\`\`\`${error}\`\`\``)
                            .setColor('Red')
                            .setFooter({ text: `FAILED EXECUTE`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }
        }

    } catch (error) {
        console.log(error);
    }
});