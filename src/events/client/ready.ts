import { Events } from "discord.js";

import { Event } from "../../structures/Event";
import { success, debug } from "../../util/logger";

export default new Event({
  name: Events.ClientReady,

  execute: async (client) => {
    // Logging that the client is ready
    success("The client is now ready.");

    debug(`Logged in as ${client.user?.tag}.`);
    debug(`Client ID: ${client.user?.id}.`);
    debug(`Guilds: ${(await client.guilds.fetch()).size}.`);

    await client.ready();
  },
});
