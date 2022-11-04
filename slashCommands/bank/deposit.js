const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'deposit',
    description: "Request a deposit by sending a screenshot",
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
            name: 'screenshot',
            description: 'Send proof of payment',
            required: true,
            type: ApplicationCommandOptionType.Attachment
        }
    ],
    run: async (client, interaction) => {
        const amount = interaction.options.getNumber('amount');
        const attachment = interaction.options.getAttachment('screenshot');

        if (amount % 100 != 0) {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Invalid Amount')
                        .setDescription('The amount must be a multiple of **$100** since \`1 share = $100\`.')
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `INVALID AMOUNT`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        const loginModal = new ModalBuilder()
            .setTitle('Login')
            .setCustomId('deposit_modal');

        const idInput = new TextInputBuilder()
            .setCustomId('idInput')
            .setPlaceholder('Enter your account ID here')
            .setStyle(TextInputStyle.Short)
            .setLabel('Account ID')
            .setMinLength(12)
            .setMaxLength(12)
            .setRequired(true);

        const passphraseInput = new TextInputBuilder()
            .setCustomId('passphraseInput')
            .setPlaceholder('Enter your account passphrase here')
            .setStyle(TextInputStyle.Short)
            .setLabel('Account Passphrase')
            .setMinLength(0)
            .setMaxLength(255)
            .setRequired(true);

        const idRow = new ActionRowBuilder()
            .addComponents(idInput);

        const passphraseRow = new ActionRowBuilder()
            .addComponents(passphraseInput);

        loginModal.addComponents(idRow, passphraseRow);
        await interaction.showModal(loginModal);

        return module.exports = { amount, attachment };
    }
};