const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports.name = "investigation";

module.exports.builder = new SlashCommandBuilder()
    .setName(module.exports.name)
    .setDescription("Pour gérer les enquêtes de l'U.S.U.")
    .addSubcommand(subcommand => 
        subcommand.setName("create")
        .setDescription("Crée une nouvelle enquête")
        .addStringOption(option => option.setName("name").setDescription("Défini le nom de l'enquête").setRequired(true))
        .addStringOption(option => option.setName("message_id").setDescription("ID du message de description de l'enquête").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand.setName("add_deputy")
        .setDescription("Ajoute un nouveau membre à l'enquête")
        .addIntegerOption(option => option.setName("case_id").setDescription("L'identifiant de l'enquête (pour Case #01, ce serait 1)").setRequired(true).setMinValue(1).setMaxValue(99))
        .addUserOption(option => option.setName("target").setDescription("Le membre U.S.U. à être rajouté").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand.setName("revoke_deputy")
        .setDescription("Enlève un membre sur une enquête U.S.U.")
        .addIntegerOption(option => option.setName("case_id").setDescription("L'identifiant de l'enquête (pour Case #01, ce serait 1)").setRequired(true).setMinValue(1).setMaxValue(99))
        .addUserOption(option => option.setName("target").setDescription("Le membre U.S.U. à être retiré").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand.setName("delete")
        .setDescription("Supprime une ancienne enquête")
        .addIntegerOption(option => option.setName("case_id").setDescription("Identifiant de l'enquête (1, pour le Case#01)").setRequired(true).setMinValue(1).setMaxValue(99))
    )


module.exports.execute = (interaction, db) => {
    if (!interaction.member.roles.cache.hasAny("1087075664320020580") && !interaction.member.roles.cache.hasAny("1095973731156897825")) { // Leader or Co-Leader
        interaction.reply({content: "❌ Vous n'êtes pas habilité", ephemeral: true});
        return
    }

    switch (interaction.options.getSubcommand()) {
        case "create":
            createCmd(interaction, db);
            break;
        
        case "add_deputy":
            add_deputyCmd(interaction, db);
            break;

        case "revoke_deputy":
            revoke_deputyCmd(interaction, db);
            break;

        case "delete":
            deleteCmd(interaction, db)
            break;

        default:
            break;
    }
};

//! FUNCTION
async function createCmd(interaction, db) {
    await interaction.deferReply({ephemeral: true});

    // Créer le thread pour l'enquête
    const forumChannel = interaction.guild.channels.cache.get("1198179497325903953");
    const investigationChannel = interaction.guild.channels.cache.get("1116358965048115320");
    const messageID = interaction.options.getString("message_id");

    let descriptionMsgContent;
    
    await investigationChannel.messages.fetch();
    try {
        descriptionMsgContent = investigationChannel.messages.cache.get(messageID).content;
    } catch(e) {
        console.error(e);
        interaction.editReply({content: "❌ L'option 'message_id' n'est pas valide", ephemeral: true});
        return
    }

    const dbData = await db.getData("/investigations");
    const caseID = findValableID(dbData);
    let threadID;

    await forumChannel.threads.create({
        name: `Case #0${caseID} - ${interaction.options.getString("name")}`, 
        message: {content: `${descriptionMsgContent}\n\n⚠️ **Pour rejoindre cette enquête, réagissez avec ✅ !**`}, 
        reason: "/investigation command triggered"
    }).then(thread => {
        threadID = thread.id
    });
    
    // Créer TextChannel pour l'enquête
    interaction.guild.channels.create({
        name: `『📜』𝗖𝗮𝘀𝗲 #0${caseID}`, 
        type: ChannelType.GuildText, 
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: interaction.user.id,
              allow: [PermissionFlagsBits.ViewChannel],
           },
        ],
        parent: "1095971457068171364", 
        reason: "/investigation command triggered"
    }).then((channel) => {
        db.push("/investigations", [{
            caseid: caseID, 
            channelid: channel.id,
            threadid: threadID,
            deputysid: [interaction.user.id]
        }], false);

        channel.send(descriptionMsgContent);
    });

    interaction.editReply({content: "✅ Nouvelle enquête créée avec succès !", ephemeral: true});
}

//! FUNCTION
async function add_deputyCmd(interaction, db) {
    const caseID = interaction.options.getInteger("case_id");

    const dbCaseID = await db.getIndex("/investigations", caseID, "caseid");
    if (dbCaseID === -1) {
        interaction.reply({content: `❌ Le Case #0${caseID} n'existe pas`, ephemeral: true});
        return
    }

    const dbData = await db.getData(`/investigations[${dbCaseID}]`);
    const deputy = interaction.options.getUser("target");

    // Ajouter les perms du channel
    const caseChannel = interaction.guild.channels.cache.get(dbData.channelid);

    caseChannel.permissionOverwrites.edit(deputy.id, { ViewChannel: true });

    // Ajouter le Deputy à la db
    dbData.deputysid.push(deputy.id);
    db.delete(`/investigations[${dbCaseID}]`);
    db.push("/investigations", [dbData], false);

    interaction.reply({content: `✅ Le Deputy <@${deputy.id}> a été rajouté au **Case#0${dbData.caseid}**`, ephemeral: true});
}

//! FUNCTION
async function revoke_deputyCmd(interaction, db) {
    const caseID = interaction.options.getInteger("case_id");

    const dbCaseID = await db.getIndex("/investigations", caseID, "caseid");
    if (dbCaseID === -1) {
        interaction.reply({content: `❌ Le Case #0${caseID} n'existe pas`, ephemeral: true});
        return
    }

    const dbData = await db.getData(`/investigations[${dbCaseID}]`);
    const deputy = interaction.options.getUser("target");

    if (!dbData.deputysid.includes(deputy.id)) {
        interaction.reply({content: `❌ Le Deputy <@${deputy.id}> ne fait pas parti du **Case#0${dbData.caseid}**`, ephemeral: true});
        return
    }

    // Enlever les perms du channel pour le Deputy
    const caseChannel = interaction.guild.channels.cache.get(dbData.channelid);
    caseChannel.permissionOverwrites.delete(deputy.id, "/investigation command triggered");

    // Enlever le Deputy de la db
    const id = dbData.deputysid.indexOf(deputy.id);
    dbData.deputysid.splice(id, 1);
    db.delete(`/investigations[${dbCaseID}]`);
    db.push("/investigations", [dbData], false);

    interaction.reply({content: `✅ Le Deputy <@${deputy.id}> a été révoqué du **Case#0${dbData.caseid}**`, ephemeral: true});
    
}

//! FUNCTION
async function deleteCmd(interaction, db) {
    await interaction.deferReply({ephemeral: true});

    const caseID = interaction.options.getInteger("case_id");

    const dbCaseID = await db.getIndex("/investigations", caseID, "caseid");
    if (dbCaseID === -1) {
        interaction.editReply({content: `❌ Le Case #0${caseID} n'existe pas`, ephemeral: true});
        return
    }

    const dbData = await db.getData(`/investigations[${dbCaseID}]`);

    // Supprimer le Case de la DB
    db.delete(`/investigations[${dbCaseID}]`);

    // Supprimer le Channel
    interaction.guild.channels.delete(dbData.channelid, "/investigation command triggered");

    // Archiver le Thread
    interaction.guild.channels.cache.get(dbData.threadid).setArchived(true);

    interaction.editReply({content: `✅ Le Case #0${dbData.caseid} a bel et bien été archivé et supprimé`, ephemeral: true});
}

function findValableID(data) {
    let array = [];

    for (let id = 0; id < data.length; id++) {
        array.push(data[id].caseid);
    }

    let i = 1;
    while (true) {
        if (!array.includes(i)) return i

        i++;
    }
}