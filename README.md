# Lot Calc

Discord bot that calculates forex & metals lot size from account balance, risk %, and stop loss (pips).

## Slash command

```
/calc-lot pair:<PAIR> balance:<USD> risk:<% > sl:<pips>
```

**Supported pairs:** `EURUSD`, `GBPUSD`, `USDJPY`, `AUDUSD`, `NZDUSD`, `XAUUSD`, `XAGUSD`

## Setup

1. Create a Discord application + bot in the [Discord Developer Portal](https://discord.com/developers/applications), then copy the bot token and application (client) ID.

2. Clone and install:

```bash
git clone https://github.com/HaiderGhauri/lot-calc.git
cd lot-calc
npm install
```

3. Copy env and fill in values:

```bash
cp .env.example .env
```

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
# Optional — faster command updates while testing:
# GUILD_ID=your_server_id
```

4. Invite the bot to your server (OAuth2 → URL Generator → scopes: `bot`, `applications.commands`).

5. Register slash commands, then start:

```bash
npm run deploy
npm start
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run deploy` | Register `/calc-lot` with Discord |
| `npm start` | Run the bot (nodemon) |

## How lot size is calculated

```
risk amount = balance × (risk% / 100)
lot size    = risk amount ÷ (stop pips × pip value per standard lot)
```

Result is rounded down to `0.01` lot steps (broker-style minimum).
