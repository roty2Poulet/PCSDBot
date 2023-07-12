const { SlashCommandBuilder } = require("discord.js");
const nodeFetch = require("node-fetch");

module.exports.name = "service";

module.exports.builder = new SlashCommandBuilder()
    .setName(module.exports.name)
    .setDescription("Prendre son service pour aujourd'hui")
;

module.exports.execute = async (interaction, db) => {

    // VERIFICATIONS
    if (interaction.channelId != "1101181689490845786") {
        interaction.reply({ content: "❌ Vous ne pouvez envoyer cette commande uniquement dans <#1101181689490845786>", ephemeral: true });
        return
    } else if (!interaction.member.roles.cache.has("1064185602620280912")) {
        interaction.reply({ content: "❌ Vous ne pouvez pas exécuter cette commande !", ephemeral: true });
        return
    }

    // VERIFY IF STEAM IS LINKED
    const memberIndex = await db.getIndex("/steamIDs", interaction.member.id, "memberID");
    if (memberIndex == -1) {
        interaction.reply({ content: "❌ Veuillez lier votre compte Steam avant dans <#1101167704800497695>", ephemeral: true});
        return
    }

    // GET STEAMID64 AND IF CONNECTED TO MONOLITH
    const steamIDsArray = await db.getData("/steamIDs");
    const memberSteamID = steamIDsArray[memberIndex].steamID;

    const key = process.env.STEAMAPIKEY;
    const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${memberSteamID}`;
    let isConnected = false;

    await nodeFetch(url).then(res => res.json()).then(data => {
        const gameID = data.response.players[0].gameid ?? null;
        const gameServerIP = data.response.players[0].gameserverip ?? null;
        const gmodID = "4000";
        const monolithIP = "208.103.169.233:27015";
        
        if (gameID == gmodID && gameServerIP == monolithIP) {
            isConnected = true;
        }
    });

    // IF NOT CONNECTED --> AVERTISSEMENT
    if (!isConnected) {
        interaction.reply({ content: "❌ Vous n'êtes pas connecté à MonolithRP. Ceci sera signalé !", ephemeral: true });
        interaction.guild.channels.cache.get("1079484049380352092").send(`<@${interaction.member.id}> ----> **Avertissement** ----> Tentative de /service sans être connecté à MonolithRP`);
        return
    }

    // CHECK IF ALREADY TOOK SERVICE && PUSH IN DB "prisesDeService"
    const rawDate = new Date();
    const today = rawDate.getDay();

    const memberIndex2 = await db.getIndex("/prisesDeService", interaction.member.id, "memberID");

    if (memberIndex2 == -1) {
        await db.push("/prisesDeService", [{
            memberID: interaction.member.id,
            daysOfWork: [today]
        }], false);
    } else {
        const prisesDeServiceArray = await db.getData("/prisesDeService");
        const memberInfo = prisesDeServiceArray[memberIndex2];

        if (!memberInfo.daysOfWork.includes(today)) {
            memberInfo.daysOfWork.push(today);
        } else {
            interaction.reply({ content: "❌ Vous avez déjà pris votre service aujourd'hui", ephemeral: true});
            return
        }
    }

    // CONCLUSION
    interaction.reply(`✅ <@${interaction.member.id}> a pris son service avec succès`);
};