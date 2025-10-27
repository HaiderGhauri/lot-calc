import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
  .setName('calc-lot')
  .setDescription('Risk-based lot size calculate kare')
  .addStringOption(o =>
    o
      .setName('pair')
      .setDescription('Forex pair e.g. EURUSD, XAUUSD')
      .setRequired(true)
      // .setAutocomplete(true)  // 👈 ye line important hai
  )
  .addNumberOption(o =>
    o.setName('balance').setDescription('Account balance').setRequired(true))
  .addNumberOption(o =>
    o.setName('risk').setDescription('Risk % per trade').setRequired(true))
  .addNumberOption(o =>
    o.setName('sl').setDescription('Stop Loss in pips').setRequired(true))
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  const body = commands;
  if (process.env.GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body }
    );
    console.log('✅ Guild slash commands registered (instant).');
  } else {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body });
    console.log('✅ Global slash commands registered (propagation may take a bit).');
  }
})();