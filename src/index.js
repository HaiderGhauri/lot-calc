import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// USD-quoted pairs ≈ $10 per pip per 1.0 lot (simplified)
function pipValuePerStdLot(pair) {
  const p = pair.toUpperCase();
  if (p.endsWith("USD")) return 10; // e.g., EURUSD, GBPUSD
  if (p.endsWith("JPY")) return 9; // rough approx
  return 10; // fallback
}

function calcLot({ balance, riskPercent, stopPips, pair }) {
  const riskAmount = balance * (riskPercent / 100);
  const pipStd = pipValuePerStdLot(pair);
  if (stopPips <= 0 || pipStd <= 0) return 0;
  const lots = riskAmount / (stopPips * pipStd);
  return Number(lots.toFixed(3)); // keep 3 dp so 0.067 shows nicely
}

function formatReply({ pair, balance, risk, sl, lots }) {
  return [
    `💹 **${pair.toUpperCase()} Lot Size Calculation**`,
    "────────────────",
    `**Balance:** $${balance}`,
    `**Risk:** ${risk}%`,
    `**Stop Loss:** ${sl} pips`,
    `👉 **Lot Size:** \`${lots}\``,
  ].join("\n");
}

client.once(Events.ClientReady, (c) => {
  console.log(`🤖 Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (i) => {
  if (i.isAutocomplete()) {
    const focused = i.options.getFocused(true);
    if (focused.name === "pair") {
      const search = focused.value.toUpperCase();
      const allPairs = Object.keys(ALLOWED_PAIRS);

      // simple filter
      const filtered = allPairs
        .filter((p) => p.startsWith(search))
        .slice(0, 25);

      await i.respond(filtered.map((p) => ({ name: p, value: p })));
    }
    return;
  }

  // 👇 Command execute hone par
  if (!i.isChatInputCommand() || i.commandName !== "calc-lot") return;

  const pair = i.options.getString("pair", true).toUpperCase();
  const balance = i.options.getNumber("balance", true);
  const risk = i.options.getNumber("risk", true);
  const sl = i.options.getNumber("sl", true);

  const lots = calcLot({ balance, riskPercent: risk, stopPips: sl, pair });
  const msg = formatReply({ pair, balance, risk, sl, lots });
  await i.reply(msg);
});

client.login(process.env.DISCORD_TOKEN);
