const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ApplicationCommandType, ApplicationCommandOptionType, SelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');

module.exports = {
    name: 'poll',
    description: "Administrator Command, create a poll based on amount of shares a user has.",
    cooldown: 3000,
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'Administrator',
    options: [
        {
            name: 'create',
            description: 'Specify an amount to add.',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'delete',
            description: 'Specify an account to add funds too.',
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    run: async (client, interaction) => {
        if (interaction.options.getSubcommand() === 'create') {
            const createPollModal = new ModalBuilder()
                .setTitle('Create A Poll')
                .setCustomId('createpoll_modal');

            const titleInput = new TextInputBuilder()
                .setCustomId('titleInput')
                .setPlaceholder('Enter the title of the poll here')
                .setStyle(TextInputStyle.Short)
                .setLabel('Poll Title')
                .setMinLength(0)
                .setMaxLength(255)
                .setRequired(true);

            const durationInput = new TextInputBuilder()
                .setCustomId('durationInput')
                .setPlaceholder('Ex: 4d, 3h, 2m, 1s')
                .setStyle(TextInputStyle.Short)
                .setLabel('Duration')
                .setMinLength(2)
                .setMaxLength(255)
                .setRequired(true);

            const descriptionInput = new TextInputBuilder()
                .setCustomId('descriptionInput')
                .setPlaceholder('Enter the description of the poll here')
                .setStyle(TextInputStyle.Paragraph)
                .setLabel('Description')
                .setMinLength(1)
                .setMaxLength(255)
                .setRequired(false);

            const titleRow = new ActionRowBuilder()
                .addComponents(titleInput);

            const durationRow = new ActionRowBuilder()
                .addComponents(durationInput);

            const descriptionRow = new ActionRowBuilder()
                .addComponents(descriptionInput);

            createPollModal.addComponents(titleRow, durationRow, descriptionRow);
            return await interaction.showModal(createPollModal);
        } else {
            // Get an array of all polls
            const db = new QuickDB({ filePath: `./data/polls.sqlite` });
            const polls = await db.get(`${interaction.guild.id}`);
            // Get all keys of poll and append them to an array
            // Check if there are any keys in polls, then check if the key is empty
            if (polls && Object.keys(polls).length > 0) {
                var pollIDs = Object.keys(polls);
            } else {
                return await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('No Polls Found')
                            .setDescription('There are no polls to delete. Start by creating one with \`/poll create\.`')
                            .setColor('Red')
                    ]
                });
            }

            // Create a Select Menu
            const selectMenu = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('deletepoll_selectmenu')
                        .setPlaceholder('Select a poll to delete')
                );

            for (let i = 0; i < pollIDs.length; i++) {
                selectMenu.components[0].addOptions({
                    label: `${pollIDs[i]}`,
                    value: `${pollIDs[i]}`
                });
            }

            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Polls')
                        .setDescription('Select a poll to delete.')
                        .setColor('White')
                        .setTimestamp()
                        .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                ],
                components: [selectMenu]
            });
        }
    }
};