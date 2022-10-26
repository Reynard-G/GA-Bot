const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
	id: 'withdraw_approve_button',
	permissions: [],
	run: async (client, interaction) => {
		let { requestEmbed, buttons, percentage, constant, taxedAmount, amount, balance, argumentUser, userID } = require("../slashCommands/bank/withdraw");
		let db = new QuickDB({ filePath: `./data/roles.sqlite` });
		const buttonUser = await interaction.guild.members.cache.get(interaction.user.id);
		const bankerRole = await db.get(`${interaction.guild.id}.bankerRole`) ?? null;

		if (!buttonUser.roles.cache.has(bankerRole)) {
			const permEmbed = new EmbedBuilder()
				.setTitle('Insufficient Permissions')
				.setDescription(`You have insufficient permissions due to not having the <@&${bankerRole}> role.`)
				.setColor('Red')
				.setTimestamp()
				.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

			return await interaction.reply({ embeds: [permEmbed], ephemeral: true });
		}

		argumentUser.balance.subtract(taxedAmount);
		const currBalance = argumentUser.balance.get();

		buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Approve')
					.setStyle('Success')
					.setEmoji('<:approved:815575466231463956>')
					.setCustomId('withdraw_approve_button')
					.setDisabled(),
				new ButtonBuilder()
					.setLabel('Deny')
					.setStyle('Danger')
					.setEmoji('<:denied:815575438750777344>')
					.setCustomId('withdraw_deny_button')
					.setDisabled(),
				new ButtonBuilder()
					.setLabel('Send Image')
					.setStyle('Secondary')
					.setEmoji('<:denied:1029595480734322728>')
					.setCustomId('withdraw_approve_image_button')
			);

		requestEmbed = new EmbedBuilder()
			.setTitle('Withdrawal Request')
			.setDescription(`<@${userID}>'s withdrawal request of **$${amount}** is **ACCEPTED** and was taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**. \n Balance: **$${balance}**  ➡️  **$${currBalance}**.`)
			.setColor('Green')
			.setTimestamp()
			.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

		await interaction.update({ embeds: [requestEmbed], components: [buttons] });
		module.exports = { requestEmbed, buttons, userID };

		const approveEmbed = new EmbedBuilder()
			.setTitle('Withdrawal Approved')
			.setDescription(`Approved <@${userID}>'s request to withdrawal **$${amount}** taxed to **$${taxedAmount}**.`)
			.setColor('Green')
			.setTimestamp()
			.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

		await client.users.cache.get(userID).send({ embeds: [approveEmbed] });

		db = new QuickDB({ filePath: `./data/withdrawRequests.sqlite` });
		return await db.delete(`${interaction.guild.id}.${interaction.user.id}.amount`);
	}
};
