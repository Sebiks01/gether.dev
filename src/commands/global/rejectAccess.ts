import { EmbedBuilder, SlashCommandBuilder, time, TimestampStyles } from "discord.js";

import { Command } from "../../structures/Command";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("odrzuc")
    .setDescription("Odrzuca dostęp do darmowej strefy.")
    .addUserOption((option) =>
      option.setName("user").setDescription("Użytkownik który nie spełnia wymagań darmowej strefy.").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Powód odrzucenia dostępu do darmowej strefy.").setRequired(true)
    ),

  execute: async ({ client, interaction }) => {
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    const { member } = interaction;

    let adminRole;

    try {
      adminRole = await member.guild.roles.fetch(client.config.freeZoneAdminRoleId);
    } catch (error) {
      await interaction.followUp("Wystąpił błąd podczas pobierania roli admina.");
      console.error("Role not found. (Admin)");
    }

    if (!adminRole) {
      await interaction.followUp("Nie znaleziono roli. (Admin)");
      return;
    }

    if (!member.roles.cache.has(adminRole.id)) {
      await interaction.followUp("Nie masz uprawnień do używania tej komendy.");
    }

    let user = interaction.options.getUser("user");

    if (!user) {
      await interaction.followUp("Nie znaleziono użytkownika.");
      return;
    }

    const rejectedMember = await interaction.guild.members.fetch(user.id);

    if (!rejectedMember) {
      await interaction.followUp("Nie znaleziono użytkownika.");
      return;
    }

    let reason = interaction.options.getString("reason");

    await interaction.followUp(`Użytkownik ${user.username} nie otrzymał dostępu do darmowej strefy.`);

    return await interaction.channel?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Gether.dev | Nadawanie rangi")
          .setDescription(
            `> Ranga nie została nadana do **strefy darmowej**.\n\n> Użytkownik: ${
              rejectedMember.user
            }\n> Administrator: ${member.user}\n\n> Powód odrzucenia: ${reason}\n\n> Odrzucone: ${time(
              new Date(),
              TimestampStyles.RelativeTime
            )}`
          )
          .setColor(16711680)
          .setFooter({
            text: "gether.dev@2024",
            iconURL:
              "https://cdn.discordapp.com/avatars/375323948881018886/d5869f3816e18f51108300468f4b9ea4.png?size=4096",
          }),
      ],
    });
  },
});
