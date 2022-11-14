const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
	id: 'deposit_deny_button',
	permissions: [],
	run: async (client, interaction) => {
		let { requestEmbed, buttons, attachment, percentage, constant, taxedAmount, amount, userID, id } = require("../modals/deposit");

		buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Approve')
					.setStyle('Success')
					.setEmoji('<:approved:815575466231463956>')
					.setCustomId('deposit_approve_button')
					.setDisabled(),
				new ButtonBuilder()
					.setLabel('Deny')
					.setStyle('Danger')
					.setEmoji('<:denied:815575438750777344>')
					.setCustomId('deposit_deny_button')
					.setDisabled(),
				new ButtonBuilder()
					.setLabel('Send Image')
					.setStyle('Secondary')
					.setEmoji('<:denied:1029595480734322728>')
					.setCustomId('deposit_deny_image_button')
			);

		requestEmbed = new EmbedBuilder()
			.setTitle('Deposit Request')
			.setDescription(`
			Amount: **$${amount}**
			Taxed Amount (${percentage}% + $${constant}): **$${taxedAmount}**
			Status: **DENIED**
			Current Balance: **$${balance}**
			`)
			.setImage(attachment.proxyURL)
			.setColor('Red')
			.setTimestamp()
			.setFooter({ text: `Gamblers Anonymous`, iconURL: interaction.guild.iconURL() });

		await interaction.update({ embeds: [requestEmbed], components: [buttons] });
		module.exports = { requestEmbed, buttons, userID, id };

		await client.users.cache.get(userID).send({
			embeds: [
				new EmbedBuilder()
					.setTitle('Deposit Denied')
					.setDescription(`
					Amount: **$${amount}**
					Taxed Amount (${percentage}% + $${constant}): **$${taxedAmount}**
					Status: **DENIED**
					Current Balance: **$${balance}**
					`)
					.setColor('Red')
					.setTimestamp()
					.setFooter({ text: `Gamblers Anonymous`, iconURL: interaction.guild.iconURL() })
			]
		});

		const db = new QuickDB({ filePath: `./data/depositRequests.sqlite` });
		return await db.delete(`${interaction.guild.id}.${id}.amount`);
	}
};