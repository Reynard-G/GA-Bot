const { EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
	id: 'deposit_approve_button',
	permissions: [],
	run: async (client, interaction) => {
		let { requestEmbed, buttons, attachment, percentage, constant, taxedAmount, amount, balance, userID, id } = require("../modals/deposit");
		let db = new QuickDB({ filePath: `./data/roles.sqlite` });
		const conn = await client.pool.getConnection();
		balance = (await conn.query(`SELECT balance FROM eco WHERE id = '${id}';`))[0].balance; // Get balance again to update it
		const currBalance = +Number(Math.round(parseFloat((balance + taxedAmount) + "e2")) + "e-2");
		await conn.query(`UPDATE eco SET balance=${currBalance} WHERE id='${id}';`);

		buttons.components[0].setDisabled(true);
		buttons.components[1].setDisabled(true);

		requestEmbed = new EmbedBuilder()
			.setTitle('Deposit Request')
			.setDescription(`\`${id}\`'s deposit request of **$${amount}** is **ACCEPTED** and was taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**. \n Balance: **$${balance}**  ➡️  **$${currBalance}**.`)
			.setImage(attachment.proxyURL)
			.setColor('Green')
			.setTimestamp()
			.setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() });

		await interaction.update({
			embeds: [requestEmbed],
			components: [buttons]
		});

		const approveEmbed = new EmbedBuilder()
			.setTitle('Deposit Approved')
			.setDescription(`Approved \`${id}\`'s request to deposit **$${amount}** taxed to **$${taxedAmount}**.`)
			.setColor('Green')
			.setTimestamp()
			.setFooter({ text: `${id} `, iconURL: interaction.guild.iconURL() });

		await client.users.cache.get(userID).send({
			embeds: [approveEmbed]
		});

		conn.release();
		db = new QuickDB({ filePath: `./data/depositRequests.sqlite` });
		return await db.delete(`${interaction.guild.id}.${id}.amount`);
	}
};
