const { SlashCommandBuilder } = require("discord.js");

module.exports.name = "linksteam";

module.exports.builder = new SlashCommandBuilder()
    .setName(module.exports.name)
    .setDescription("Reliez votre compte steam au PCSDBot")
    .addStringOption(option => option.setName("steamid").setDescription("Entrez votre SteamID64").setRequired(true))
;

module.exports.execute = async (interaction, db) => {

    // VERIFICATIONS
    if (interaction.channelId != "1101167704800497695") {
        interaction.reply({ content: "❌ Vous ne pouvez envoyer cette commande uniquement dans <#1101167704800497695>", ephemeral: true });
        return
    } else if (!interaction.member.roles.cache.has("1064185602620280912")) {
        interaction.reply({ content: "❌ Vous ne pouvez pas exécuter cette commande !", ephemeral: true });
        return
    } else if (isNaN(parseInt(interaction.options.getString("steamid")))) {
        interaction.reply({ content: "❌ Entrez un steamID64 valide !", ephemeral: true});
        return
    }

    // DB CHECK
    const dbID = await db.getIndex("/steamIDs", interaction.member.id, "memberID");
    if (dbID != -1) {
        interaction.reply({ content: "❌ Vous avez déjà relié votre compte Steam au PCSDBot", ephemeral: true });
        return
    }

    // DB PUSH
    await db.push("/steamIDs/", [{
        steamID: interaction.options.getString("steamid"),
        memberID: interaction.member.id
    }], false);

    interaction.reply("✅ Compte Steam lié avec succès !");
};