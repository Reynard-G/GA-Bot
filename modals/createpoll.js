const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const moment = require('moment');

module.exports = {
    id: 'createpoll_modal',
    permissions: [],
    run: async (client, interaction) => {
        const title = interaction.fields.getTextInputValue('titleInput');
        const duration = interaction.fields.getTextInputValue('durationInput');
        const description = interaction.fields.getTextInputValue('descriptionInput');
        const channel = interaction.channel;

        // Convert (2d, 3h, 4m, 5s) to data: {days: 2, hours: 3, minutes: 4, seconds: 5} and catch improper formats
        const durationFormat = duration.match(/(\d+[dhms])/g);
        if (!durationFormat) {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Invalid Duration')
                        .setDescription('Please enter a valid duration using the format 4d, 3h, 2m, 1s.')
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() })
                ]
            });
        }
        const durationData = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
        for (const d of durationFormat) {
            const num = parseInt(d);
            if (d.endsWith('d')) durationData.days = num;
            else if (d.endsWith('h')) durationData.hours = num;
            else if (d.endsWith('m')) durationData.minutes = num;
            else if (d.endsWith('s')) durationData.seconds = num;
        }

        // Convert data to unix timestamp
        const durationUnixTimestamp = moment().add(durationData).unix();

        // Convert durationData to miliseconds
        const durationMiliseconds = moment.duration(durationData).asMilliseconds();

        // Create a random 6 digit poll id and store it in the database
        const db = new QuickDB({ filePath: `./data/polls.sqlite` });
        const pollId = Math.floor(Math.random() * 1000000);
        await db.set(`${interaction.guild.id}.${pollId}.aye`, {count: 0, users: []});
        await db.set(`${interaction.guild.id}.${pollId}.nay`, {count: 0, users: []});

        // Create poll
        let pollEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(
                description +
                "\n\n" +
                `Ends: <t:${durationUnixTimestamp}:R> (<t:${durationUnixTimestamp}:f>)` +
                `\n`
            )
            .addFields(
                { name: 'Aye: ', value: '0 shares (0.00%)', inline: true },
                { name: 'Nay: ', value: '0 shares (0.00%)', inline: true }
            )
            .setColor(0x2F3136)
            .setTimestamp()
            .setFooter({ text: `Poll ID: ${pollId}`, iconURL: interaction.guild.iconURL() });

        let pollButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Aye')
                    .setStyle('Success')
                    .setEmoji('<:aye:1037563543807082536>')
                    .setCustomId('aye_button'),
                new ButtonBuilder()
                    .setLabel('Nay')
                    .setStyle('Danger')
                    .setEmoji('<:nay:1037563602305036288>')
                    .setCustomId('nay_button')
            );

        await interaction.reply({
            embeds: [pollEmbed],
            components: [pollButtons]
        });

        // Get message id & channel from interaction
        const messageId = (await interaction.fetchReply()).id;
        await db.set(`${interaction.guild.id}.${pollId}.messageId`, messageId);
        await db.set(`${interaction.guild.id}.${pollId}.channelId`, channel.id);

        client.timers[`${pollId}`] = setTimeout(async () => {
            pollEmbed.setDescription(
                description +
                "\n\n" +
                `Ended: <t:${durationUnixTimestamp}:R> (<t:${durationUnixTimestamp}:f>)` +
                `\n`
            )
            pollButtons.components[0].setDisabled(true);
            pollButtons.components[1].setDisabled(true);

            await interaction.editReply({
                embeds: [pollEmbed],
                components: [pollButtons]
            });
        }, durationMiliseconds);

        return module.exports = { durationUnixTimestamp, channel, pollEmbed, pollButtons, pollId };
    }
};