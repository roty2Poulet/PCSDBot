const { SlashCommandBuilder } = require("discord.js");

module.exports.name = "unlinksteam";

module.exports.builder = new SlashCommandBuilder()
    .setName(module.exports.name)
    .setDescription("Déliez votre compte steam du PCSDBot")
;

module.exports.execute = async (interaction, db) => {
    // VERIFICATIONS
    if (interaction.channelId != "1101167704800497695") {
        interaction.reply({ content: "❌ Vous ne pouvez envoyer cette commande uniquement dans <#1101167704800497695>", ephemeral: true });
        return
    } else if (!interaction.member.roles.cache.has("1064185602620280912")) {
        interaction.reply({ content: "❌ Vous ne pouvez pas exécuter cette commande !", ephemeral: true });
        return
    }

    // DB CHECK
    const dbIndex = await db.getIndex("/steamIDs", interaction.member.id, "memberID");
    if (dbIndex == -1) {
        interaction.reply({ content: "❌ Vous n'avez pas relié votre compte Steam au PCSDBot", ephemeral: true });
        return
    }

    // DB DELETE
    await db.delete(`/steamIDs[${dbIndex}]`);

    // CONCLUSION
    interaction.reply("✅ Compte Steam délié avec succès");
};