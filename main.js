// #----------Dependencies----------#
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client ({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

require("dotenv").config();
// -----------Dependencies-----------


// #---------JsonDB Setting---------#
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

const db = new JsonDB(new Config("db", true, true, '/'));
// ----------JsonDB Setting----------


// #---------Custom Imports---------#
const createPrivateVC = require("./commands/misc/privateVocals/createPrivateVC.js");
const deletePrivateVC = require("./commands/misc/privateVocals/deletePrivateVC.js");
const effectifsCmd = require("./commands/misc/effectifs/effectifsCmd.js");
const serviceCmd = require("./commands/misc/service/service.js");
const linkSteamCmd = require("./commands/misc/service/linkSteam.js");
const sendTable = require("./commands/misc/service/sendTable.js");
const unlinkSteamCmd = require("./commands/misc/service/unlinkSteam.js");
const investigationCmd = require("./commands/misc/investigation/investigationCmd.js");
// ----------Custom Imports----------



client.once("ready", async () => {

    const PCSDGuild = client.guilds.cache.get("1056917546659483728");

    // Création commande: await PCSDGuild.commands.create();
    
    // Récupération des commandes serveur
    await PCSDGuild.commands.fetch();

    //* Tableau des prises de service
    sendTable.execute(PCSDGuild, db);

    // Message de confirmation
    console.log("PCSD Bot connecté et paré à créer des vocaux !!");
});


// VOC TEMPORAIRE
client.on("voiceStateUpdate", async (oldState, newState) => {

    if (!oldState.channel && !newState.channel) { return }

    if (!newState.channel) { // Qqun DECO

        await deletePrivateVC.execute(oldState.member, oldState.guild, db);

    } else if (!oldState.channel) { // Qqun SE CO

        if (newState.channel.id !== "1056917547305410576") { return }

        await createPrivateVC.execute(newState.member, newState.guild, db);

    } else if (oldState.channel && newState.channel) { // Qqun MOVE DE CHANNEL ou SE MUTE dans un channel créé

        if (newState.channel.id === "1056917547305410576") { // REJOINS le créateur de vocaux

            await createPrivateVC.execute(newState.member, newState.guild, db);

        } else if (oldState.channel.id !== "1056917547305410576") { // SE MOVE DANS n'importe quel channel (à part créateur de vocaux)

            const dbData = await db.getData("/channels");

            const dbID = await db.getIndex("/channels", oldState.member.id, "ownerID");

            if (dbID === -1) { return }

            if (oldState.member.voice.mute || oldState.member.voice.deaf || !oldState.member.voice.mute || !oldState.member.voice.deaf) { return }

            await deletePrivateVC.execute(oldState.member, oldState.guild, db);

        }

    } else {
        return
    }

});


// COMMANDES PCSO
client.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand) return

    if (interaction.commandName === serviceCmd.name) {
        serviceCmd.execute(interaction, db);
    } else if (interaction.commandName === linkSteamCmd.name) {
        linkSteamCmd.execute(interaction, db);
    } else if (interaction.commandName === unlinkSteamCmd.name) {
        unlinkSteamCmd.execute(interaction, db);
    } else if (interaction.commandName === effectifsCmd.name) {
        effectifsCmd.execute(interaction);
    } else if (interaction.commandName === investigationCmd.name) {
        investigationCmd.execute(interaction, db);
    }

});



client.login(process.env.TOKEN);