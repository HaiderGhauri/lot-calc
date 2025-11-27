// tools/clear-commands.js
import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID  = process.env.GUILD_ID; // optional

(async () => {
  // clear guild (if GUILD_ID present)
  if (GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );
    console.log(`🧹 Cleared GUILD commands for ${GUILD_ID}`);
  }

  // clear global (always or when you want)
  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: [] }
  );
  console.log('🧹 Cleared GLOBAL commands');
})();