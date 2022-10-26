const { EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

module.exports = {
	id: 'deposit_approve_button',
	permissions: [],
	run: async (client, interaction) => {
		let { requestEmbed, buttons, attachment, percentage, constant, taxedAmount, amount, balance, argumentUser, userID } = require("../slashCommands/bank/deposit");
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

		argumentUser.balance.add(taxedAmount);
		const currBalance = argumentUser.balance.get();

		buttons.components[0].setDisabled(true);
		buttons.components[1].setDisabled(true);

		requestEmbed = new EmbedBuilder()
			.setTitle('Deposit Request')
			.setDescription(`<@${userID}>'s deposit request of **$${amount}** is **ACCEPTED** and was taxed at a rate of **${percentage}%** + **$${constant}** = **$${taxedAmount}**. \n Balance: **$${balance}**  ➡️  **$${currBalance}**.`)
			.setImage(attachment)
			.setColor('Green')
			.setTimestamp()
			.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

		await interaction.update({ embeds: [requestEmbed], components: [buttons] });

		const approveEmbed = new EmbedBuilder()
			.setTitle('Deposit Approved')
			.setDescription(`Approved <@${userID}>'s request to deposit **$${amount}** taxed to **$${taxedAmount}**.`)
			.setColor('Green')
			.setTimestamp()
			.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

		await client.users.cache.get(userID).send({ embeds: [approveEmbed] });

		db = new QuickDB({ filePath: `./data/depositRequests.sqlite` });
		return await db.delete(`${interaction.guild.id}.${interaction.user.id}.amount`);
	}
};