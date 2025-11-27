import "dotenv/config";
import { Client, Events, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { calcLot } from "../core/calc.js";
import { ALLOWED_PAIRS, isAllowedPair } from "../core/pairs.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

function logEvent(event, data = {}) {
  // one-line JSON for easy filtering in Railway/Render logs
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...data }));
}

function buildEmbed({ pair, balance, risk, sl, lots }) {
  const color = ["XAUUSD", "XAGUSD"].includes(pair) ? 0xf59e0b : 0x22c55e; // gold vs fx

  return new EmbedBuilder()
    .setAuthor({ name: "Lot calculator" })
    .setTitle(`💹 ${pair} Lot Size Calculation`)
    .setDescription("──────────────────────────────")
    .setColor(color)
    .addFields(
      { name: "Balance", value: `$${balance}`, inline: true },
      { name: "Risk", value: `${risk}%`, inline: true },
      { name: "Stop Loss", value: `${sl} pips`, inline: true },
      {
        name: "👉 Lot Size",
        value: `\`\`\`md\n${Number(lots).toFixed(2)}\n\`\`\``,
      }
    )
    .setTimestamp();
}

client.once(Events.ClientReady, (c) => {
  console.log(`🤖 Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (i) => {
  // if (i.isAutocomplete()) {
  //   try {
  //     const focused = i.options.getFocused(true);
  //     if (focused.name !== 'pair') return;

  //     const q = String(focused.value || '').toUpperCase();
  //     const all = listPairs ? listPairs() : Object.keys(ALLOWED_PAIRS);

  //     const choices = (q ? all.filter(p => p.startsWith(q)) : all)
  //       .slice(0, 25)
  //       .map(p => ({ name: p, value: p }));

  //     await i.respond(choices).catch(err => {
  //       // 10062 here means interaction expired or already answered; ignore
  //       if (err?.code !== 10062) console.error('autocomplete respond failed:', err);
  //     });
  //   } catch (err) {
  //     // don’t throw—try empty respond once
  //     try { await i.respond([]); } catch {}
  //   }
  //   return;
  // }

  // 👇 Command execute hone par
  if (!i.isChatInputCommand() || i.commandName !== "calc-lot") return;

  const t0 = Date.now();
  try {
    await i.deferReply();

    const pair = i.options.getString("pair", true).toUpperCase();
    const balance = i.options.getNumber("balance", true);
    const risk = i.options.getNumber("risk", true);
    const sl = i.options.getNumber("sl", true);

    // 🔹 log: request received
    logEvent("calc.request", {
      userId: i.user.id,
      userTag: i.user.tag,
      guildId: i.guildId,
      pair,
      balance,
      risk,
      sl,
    });

    if (!isAllowedPair(pair)) {
      await i.editReply({ content: `⚠️ Pair **${pair}** is not supported.` });
      // 🔹 log: rejected
      logEvent("calc.reject_unsupported_pair", {
        userId: i.user.id,
        guildId: i.guildId,
        pair,
        ms: Date.now() - t0,
      });
      return;
    }

    const lots = calcLot({ balance, riskPercent: risk, stopPips: sl, pair });
    if (lots === null) {
      await i.editReply({
        content: `❌ Could not calculate lot size for ${pair}.`,
      });
      logEvent("calc.failed", {
        userId: i.user.id,
        guildId: i.guildId,
        pair,
        ms: Date.now() - t0,
      });
      return;
    }

    const embed = buildEmbed({ pair, balance, risk, sl, lots });
    await i.editReply({ embeds: [embed] });

    // 🔹 log: success
    logEvent("calc.success", {
      userId: i.user.id,
      guildId: i.guildId,
      pair,
      balance,
      risk,
      sl,
      lots,
      ms: Date.now() - t0,
    });
  } catch (err) {
    console.error("handler error:", err);
    if (i.deferred || i.replied) {
      try {
        await i.editReply("❌ Something went wrong.");
      } catch {}
    } else {
      try {
        await i.reply({ content: "❌ Something went wrong.", ephemeral: true });
      } catch {}
    }

    // 🔹 log: exception
    logEvent("calc.exception", {
      userId: i.user?.id,
      guildId: i.guildId,
      err: String(err),
      ms: Date.now() - t0,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
