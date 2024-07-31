import { GatewayIntentBits } from "discord.js";
import "dotenv/config";

import { GetherDevClient } from "./structures/GetherDevClient";

const { Guilds, GuildMembers, GuildVoiceStates } = GatewayIntentBits;

const client = new GetherDevClient({
  intents: [Guilds, GuildMembers, GuildVoiceStates],
});

client.start();
