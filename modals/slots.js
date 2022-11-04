const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const { setTimeout } = require('timers/promises');

module.exports = {
    id: 'slots_modal',
    permissions: [],
    run: async (client, interaction) => {
        let { id, balance } = require('../events/interactionModal');
        const conn = await client.pool.getConnection();
        balance = (await conn.query(`SELECT balance FROM eco WHERE id = '${id}';`))[0].balance;
        const curr_slot_emojis = ['<a:casino:1036408259717898410>', '<a:casino:1036408259717898410>', '<a:casino:1036408259717898410>'];
        const db = new QuickDB({ filePath: `./data/settings.sqlite` });
        const houseAccount = await db.get(`${interaction.guild.id}.houseAccount`);
        const availableEmojis = ['🍎', '🍊', '🍒', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', '🎊'];
        const fruitEmojis = ['🍎', '🍊', '🍒'];
        const numberEmojis = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:'];
        const jackpotEmojis = ['🎊'];

        if (balance < 100) {
            conn.release();
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Insufficient Funds')
                        .setDescription('You currently don\'t have at least **$100** in your account.')
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `INSUFFICIENT FUNDS`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        async function enoughHouseBalance(reward) {
            const houseAccountBalance = (await conn.query(`SELECT balance FROM eco WHERE id='${houseAccount}';`))[0].balance;
            if (houseAccountBalance < reward) {
                return false;
            } else {
                return true;
            }
        }

        await interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle('<a:coin_spin:809970976594329640>  Slot Machine  <a:coin_spin:809970976594329640>')
                    .addFields(
                        { name: 'Results', value: curr_slot_emojis.join(' ') },
                    )
                    .setColor('White')
                    .setTimestamp()
                    .setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
            ]
        });

        for (let i = 0; i < curr_slot_emojis.length; i++) {
            await setTimeout(1500);
            curr_slot_emojis[i] = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];

            await interaction.editReply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('<a:coin_spin:809970976594329640>  Slot Machine  <a:coin_spin:809970976594329640>')
                        .addFields(
                            { name: 'Results', value: curr_slot_emojis.join(' ') },
                        )
                        .setColor('White')
                        .setTimestamp()
                        .setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        // Win Conditions
        // Check if numbers are 123/234/345/456/567 from left to right.
        let reward = 0;
        for (let i = 0; i < numberEmojis.length - 2; i++) {
            if (curr_slot_emojis[i] === numberEmojis[i + 1] && curr_slot_emojis[i + 1] === numberEmojis[i + 2]) {
                reward = 200;
            }
        }
        if (fruitEmojis.includes(curr_slot_emojis[0]) && fruitEmojis.includes(curr_slot_emojis[1]) && fruitEmojis.includes(curr_slot_emojis[2])) {
            console.log('fruit 3');
            reward = 300;
        } else if (jackpotEmojis.includes(curr_slot_emojis[0]) && jackpotEmojis.includes(curr_slot_emojis[1]) && jackpotEmojis.includes(curr_slot_emojis[2])) {
            console.log('jackpot 3');
            reward = 500;
        } else if (curr_slot_emojis[0] === curr_slot_emojis[1] && curr_slot_emojis[1] === curr_slot_emojis[2]) {
            console.log('triples');
            reward = 300;
        } else if (curr_slot_emojis[0] === curr_slot_emojis[1] || curr_slot_emojis[1] === curr_slot_emojis[2] || curr_slot_emojis[0] === curr_slot_emojis[2]) {
            console.log('doubles');
            reward = 200;
        }

        console.log(!(await enoughHouseBalance(reward)));

        // Update balance
        conn.release();
        if (reward > 0) {
            if (!(await enoughHouseBalance(reward))) {
                return await interaction.editReply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Insufficient Funds')
                            .setDescription(`The house account does not have the sufficient funds to pay you as of now. Please try again later.`)
                            .setColor('Red')
                            .setTimestamp()
                            .setFooter({ text: `INSUFFICIENT FUNDS`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }

            await conn.query(`UPDATE eco SET balance=balance - 100 + ${reward} WHERE id='${id}'`);
            await conn.query(`UPDATE eco SET balance=balance + 100 - ${reward} WHERE id='${houseAccount}'`);

            return await interaction.editReply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('<a:coin_spin:809970976594329640> Slot Machine <a:coin_spin:809970976594329640>')
                        .setDescription(`You've won **$${reward}**!`)
                        .addFields(
                            { name: 'Results', value: curr_slot_emojis.join(' ') },
                        )
                        .setColor('Green')
                        .setTimestamp()
                        .setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
                ]
            });
        } else {

            await conn.query(`UPDATE eco SET balance=balance - 100 WHERE id='${id}'`);
            await conn.query(`UPDATE eco SET balance=balance + 100 WHERE id='${houseAccount}'`);

            return await interaction.editReply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('<a:coin_spin:809970976594329640> Slot Machine <a:coin_spin:809970976594329640>')
                        .setDescription(`Unfortunately, you didn't win anything.`)
                        .addFields(
                            { name: 'Results', value: curr_slot_emojis.join(' ') },
                        )
                        .setColor('White')
                        .setTimestamp()
                        .setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};