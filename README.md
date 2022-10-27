# Credit Union Bot

A discord.js V14 bot designed to be used in DemocracyCraft's Banking Industry.

## Requirements

* discord.js V14
* Node.js 16.9 or newer

## Getting Started

```sh
git clone https://github.com/Reynard-G/Credit-Union-Bot.git
cd Credit-Union-Bot
npm install
```
After installation finishes: 
* Create a folder named `data`
* Run `node .` to start the bot

## Configuration
Make a `.env` file and fill out the values:

```env
TOKEN=
CLIENT_ID=
GUILD_ID=
```
Leave the `GUILD_ID` in `.env` file blank if you want to register slash commands globally.

All commands that start with `/set` are to configure per-server settings.

## License

This project is licensed under the [GNU General Public License v3.0](https://choosealicense.com/licenses/mit/) License - see the LICENSE.md file for details.

## Acknowledgments

Inspiration, code snippets, etc.
* [Command-Handler Template](https://github.com/Nathaniel-VFX/Discord.js-v14-Command-Handlers)
* [discord-economy-super](https://www.npmjs.com/package/discord-economy-super)