import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { calcLot } from '../core/calc.js';
import { ALLOWED_PAIRS, isAllowedPair } from '../core/pairs.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function formatReply({ pair, balance, risk, sl, lots }) {
  return [
    `💹 **${pair.toUpperCase()} Lot Size Calculation**`,
    '────────────────',
    `**Balance:** $${balance}`,
    `**Risk:** ${risk}%`,
    `**Stop Loss:** ${sl} pips`,
    `👉 **Lot Size:** \`${lots}\``
  ].join('\n');
}

client.once(Events.ClientReady, (c) => {
  console.log(`🤖 Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (i) => {
  if (i.isAutocomplete()) {
    try {
      const focused = i.options.getFocused(true);
      if (focused.name !== 'pair') return;

      const search = String(focused.value || '').toUpperCase();
      const allPairs = Object.keys(ALLOWED_PAIRS);
      const filtered = (search ? allPairs.filter(p => p.startsWith(search)) : allPairs)
        .slice(0, 25);

      await i.respond(filtered.map(p => ({ name: p, value: p })));
    } catch (err) {
      console.error('autocomplete error:', err);
      try { await i.respond([]); } catch {}
    }
    return;
  }

  // 👇 Command execute hone par
  if (!i.isChatInputCommand() || i.commandName !== "calc-lot") return;

  const pair = i.options.getString("pair", true).toUpperCase();
  const balance = i.options.getNumber("balance", true);
  const risk = i.options.getNumber("risk", true);
  const sl = i.options.getNumber("sl", true);

  if (!isAllowedPair(pair)) {
    return i.reply({
      content: `⚠️ Pair **${pair}** is not supported yet.`,
      ephemeral: true
    });
  }

  const lots = calcLot({ balance, riskPercent: risk, stopPips: sl, pair });
  if (lots === null) {
    return i.reply({
      content: `❌ Could not calculate lot size for ${pair}.`,
      ephemeral: true
    });
  }

  const msg = formatReply({ pair, balance, risk, sl, lots });
  await i.reply(msg);
});

client.login(process.env.DISCORD_TOKEN);