import { ChannelType } from "discord.js";

import voiceCounterSchema from "../models/voice-counter";
import { Task } from "../structures/Task";

export default new Task({
  time: 30,

  execute: async ({ client, time }) => {
    const oAuth2Guilds = await client.guilds.fetch();

    oAuth2Guilds.forEach(async (oAuth2Guild) => {
      const guild = await oAuth2Guild.fetch();

      const voiceChannels = (await guild.channels.fetch()).filter(
        (channel) => channel && channel.type == ChannelType.GuildVoice
      );

      voiceChannels.forEach(async (voiceChannel) => {
        if (voiceChannel) {
          voiceChannel.members.forEach(async (member) => {
            const { guild, user } = member;

            await voiceCounterSchema.findOneAndUpdate(
              {
                guildId: guild.id,
                userId: user.id,
              },
              {
                guildId: guild.id,
                userId: user.id,
                $inc: { timer: time },
              },
              {
                upsert: true,
                new: true,
              }
            );
          });
        }
      });
    });
  },
});
