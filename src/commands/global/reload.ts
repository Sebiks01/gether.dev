import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { Command } from "../../structures/Command";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload bot systems.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  execute: async ({ client, interaction }) => {
    await interaction.deferReply({ ephemeral: true });

    // Reloading client
    const reloaded = await client.reload();

    if (reloaded) await interaction.editReply("Reloaded bot systems.");
    else await interaction.editReply("An error occurred while reloading.");
  },
});
