const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");

module.exports = {
    id: 'roulette_modal',
    permissions: [],
    run: async (client, interaction) => {
        let { id } = require('../events/interactionModal');
        let { chose } = require('../slashCommands/casino/roulette');
        
        const db = new QuickDB({ filePath: `./data/settings.sqlite` });
        const houseAccount = await db.get(`${interaction.guild.id}.houseAccount`);
        const emojis = ['⬛', '🟥', '🟨', '⬜', '🔳'];
        let board = [
            [emojis[2], emojis[1], emojis[0], emojis[1], emojis[0], emojis[1], emojis[2]],
            [emojis[0], emojis[3], emojis[3], emojis[3], emojis[3], emojis[3], emojis[0]],
            [emojis[1], emojis[3], emojis[4], emojis[4], emojis[4], emojis[3], emojis[1]],
            [emojis[0], emojis[3], emojis[3], emojis[3], emojis[3], emojis[3], emojis[0]],
            [emojis[2], emojis[1], emojis[0], emojis[1], emojis[0], emojis[1], emojis[2]]
        ];
        let ballChosen = '';
        let ballChosenEmoji;

        // Randomly select where the ball landed
        function ballLanded(emoji) {
            let randomRow = Math.floor(Math.random() * board.length);
            let randomCol = Math.floor(Math.random() * board[randomRow].length);
            while (board[randomRow][randomCol] != emoji) {
                randomRow = Math.floor(Math.random() * board.length);
                randomCol = Math.floor(Math.random() * board[randomRow].length);
            }
            board[randomRow][randomCol] = ballChosen;
        }

        // Update the user's balance based on reward
        async function updateBalance(id, reward, sign) {
            const conn = await client.pool.getConnection();
            if (sign == '+') {
                await conn.query(`UPDATE eco SET balance=balance - 100 + ${reward} WHERE id='${id}'`);
            } else {
                await conn.query(`UPDATE eco SET balance=balance + 100 - ${reward} WHERE id='${id}'`);
            }
            conn.release();
        }

        async function enoughHouseBalance(reward) {
            const conn = await client.pool.getConnection();
            const houseAccountBalance = (await conn.query(`SELECT balance FROM eco WHERE id='${houseAccount}';`))[0].balance ?? 0;
            conn.release()
            if (houseAccountBalance < reward) {
                await interaction.reply({
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
                return false;
            } else {
                return true;
            }
        }

        // Calculate percentage of ball landing on a color
        const randPercent = Math.round(Math.random() * 100);
        if (randPercent < 40 && randPercent > 0) {
            ballChosen = '<:blackroulette:1036317409876914227>';
            ballChosenEmoji = emojis[0];
        } else if (randPercent < 80 && randPercent >= 40) {
            ballChosen = '<:redroulette:1036317407393894401>';
            ballChosenEmoji = emojis[1];
        } else if (randPercent <= 100 && randPercent >= 80) {
            ballChosen = '<:goldroulette:1036317408647987241>';
            ballChosenEmoji = emojis[2];
        } else {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(`An error occurred when grabbing random numbers. Please try again. \n If this error persists, please wait until tomorrow or contact administrators.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `ERROR`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        // Ball landed on Embeds & Rewards
        let hasEnoughHouseBalance = true;
        if (ballChosen == '<:blackroulette:1036317409876914227>' && chose == 'black') {
            if (hasEnoughHouseBalance = await enoughHouseBalance(200)) {
                ballLanded(emojis[0]);
                updateBalance(id, 200, "+");
                updateBalance(houseAccount, 200, "-");

                return await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Roulette')
                            .setDescription(`The ball landed on ⬛! You've won $200!`)
                            .addFields(
                                { name: 'Board', value: `${board.map(e => e.join(' ')).join('\n')}` }
                            )
                            .setColor('Green')
                            .setTimestamp()
                            .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }
        } else if (ballChosen == '<:redroulette:1036317407393894401>' && chose == 'red') {
            if (hasEnoughHouseBalance = await enoughHouseBalance(200)) {
                ballLanded(emojis[1]);
                updateBalance(id, 200, "+");
                updateBalance(houseAccount, 200, "-");

                return await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Roulette')
                            .setDescription(`The ball landed on 🟥! You've won $200!`)
                            .addFields(
                                { name: 'Board', value: `${board.map(e => e.join(' ')).join('\n')}` }
                            )
                            .setColor('Green')
                            .setTimestamp()
                            .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }
        } else if (ballChosen == '<:goldroulette:1036317408647987241>' && chose == 'gold') {
            if (hasEnoughHouseBalance = await enoughHouseBalance(400)) {
                ballLanded(emojis[2]);
                updateBalance(id, 400, "+");
                updateBalance(houseAccount, 400, "-");

                return await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Roulette')
                            .setDescription(`The ball landed on 🟨! You've won $400!`)
                            .addFields(
                                { name: 'Board', value: `${board.map(e => e.join(' ')).join('\n')}` }
                            )
                            .setColor('Green')
                            .setTimestamp()
                            .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }
        } else if (hasEnoughHouseBalance) {
            ballLanded(ballChosenEmoji);
            updateBalance(id, 0, "+");
            updateBalance(houseAccount, 0, "-");

            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Roulette')
                        .setDescription(`Unfortunately, you've lost. The ball landed on ${ballChosen}.`)
                        .addFields(
                            { name: 'Board', value: `${board.map(e => e.join(' ')).join('\n')}` }
                        )
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `${id}`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};
