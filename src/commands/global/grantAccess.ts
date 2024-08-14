import { EmbedBuilder, SlashCommandBuilder, time, TimestampStyles } from "discord.js";

import { Command } from "../../structures/Command";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("nadaj")
    .setDescription("Nadaje dostęp do darmowej strefy.")
    .addUserOption((option) =>
      option.setName("user").setDescription("Użytkownik który otrzyma dostęp do darmowej strefy.").setRequired(true)
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

    const grantedMember = await interaction.guild.members.fetch(user.id);

    if (!grantedMember) {
      await interaction.followUp("Nie znaleziono użytkownika.");
      return;
    }

    let memberRole;

    try {
      memberRole = await member.guild.roles.fetch(client.config.freeZoneMemberRoleId);
    } catch (error) {
      await interaction.followUp("Wystąpił błąd podczas pobierania roli dostępu.");
      console.error("Role not found. (Permission)");
    }

    if (!memberRole) {
      await interaction.followUp("Nie znaleziono roli. (Permission)");
      return;
    }

    if (!grantedMember.roles.cache.has(memberRole.id)) await grantedMember.roles.add(memberRole.id);

    await interaction.followUp(`Użytkownik ${user.username} otrzymał dostęp do darmowej strefy.`);

    return await interaction.channel?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Gether.dev | Nadawanie rangi")
          .setDescription(
            `> Ranga została nadana do **darmowej strefy z zasobami**.\n\n> Użytkownik: ${
              grantedMember.user
            }\n> Administrator: ${member.user}\n> Uprawnienie: ${memberRole}\n\n> Nadane: ${time(
              new Date(),
              TimestampStyles.RelativeTime
            )}`
          )
          .setColor(392960)
          .setFooter({
            text: "gether.dev@2024",
            iconURL:
              "https://cdn.discordapp.com/avatars/375323948881018886/d5869f3816e18f51108300468f4b9ea4.png?size=4096",
          }),
      ],
    });
  },
});
