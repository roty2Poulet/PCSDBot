const { EmbedBuilder } = require("discord.js");

module.exports.execute = async (guild, effChannel) => {

    await effChannel.messages.fetch();

    const msgToDelete = await effChannel.messages.cache.find(m => m.author.bot);
    if (msgToDelete != undefined) { 
        msgToDelete.delete(); 
    }

    await guild.roles.fetch();

    const sheriffMembers = guild.roles.cache.get("1056917546714005624").members.map(m => m.user);
    const undersheriffMembers = guild.roles.cache.get("1056917546684653577").members.map(m => m.user);
    const assistantMembers = guild.roles.cache.get("1056917546684653576").members.map(m => m.user);
    const commanderMembers = guild.roles.cache.get("1056917546684653574").members.map(m => m.user);
    const captainMembers = guild.roles.cache.get("1056917546684653573").members.map(m => m.user);
    const lieutenantMembers = guild.roles.cache.get("1056917546684653572").members.map(m => m.user);
    const sgtIIMembers = guild.roles.cache.get("1056917546684653571").members.map(m => m.user);
    const sgtIMembers = guild.roles.cache.get("1056917546684653570").members.map(m => m.user);
    const dptSeniorMembers = guild.roles.cache.get("1056917546684653569").members.map(m => m.user);
    const dptIIIMembers = guild.roles.cache.get("1056917546684653568").members.map(m => m.user);
    const dptIIMembers = guild.roles.cache.get("1056917546659483737").members.map(m => m.user);
    const dptIMembers = guild.roles.cache.get("1056917546659483736").members.map(m => m.user);
    const dptTrainingMembers = guild.roles.cache.get("1056917546659483735").members.map(m => m.user);

    const embedContent =
    `
    - <@&1056917546714005624> (${sheriffMembers.length}/1): ${sheriffMembers.length == 0 ? "*N/A*" : sheriffMembers.join(', ')}


    - <@&1056917546684653577> (${undersheriffMembers.length}/1): ${undersheriffMembers.length == 0 ? "*N/A*" : undersheriffMembers.join(', ')}


    - <@&1056917546684653576> (${assistantMembers.length}/1): ${assistantMembers.length == 0 ? "*N/A*" : assistantMembers.join(', ')}


    - <@&1056917546684653574> (${commanderMembers.length}/1): ${commanderMembers.length == 0 ? "*N/A*" : commanderMembers.join(', ')}


    - <@&1056917546684653573> (${captainMembers.length}/1): ${captainMembers.length == 0 ? "*N/A*" : captainMembers.join(', ')}


    - <@&1056917546684653572> (${lieutenantMembers.length}/2): ${lieutenantMembers.length == 0 ? "*N/A*" : lieutenantMembers.join(', ')}


    - <@&1056917546684653571> (${sgtIIMembers.length}/2): ${sgtIIMembers.length == 0 ? "*N/A*" : sgtIIMembers.join(', ')}


    - <@&1056917546684653570> (${sgtIMembers.length}/3): ${sgtIMembers.length == 0 ? "*N/A*" : sgtIMembers.join(', ')}


    - <@&1056917546684653569> (${dptSeniorMembers.length}/3): ${dptSeniorMembers.length == 0 ? "*N/A*" : dptSeniorMembers.join(', ')}


    - <@&1056917546684653568> (${dptIIIMembers.length}/∞): ${dptIIIMembers.length == 0 ? "*N/A*" : dptIIIMembers.join(', ')}


    - <@&1056917546659483737> (${dptIIMembers.length}/∞): ${dptIIMembers.length == 0 ? "*N/A*" : dptIIMembers.join(', ')}


    - <@&1056917546659483736> (${dptIMembers.length}/∞): ${dptIMembers.length == 0 ? "*N/A*" : dptIMembers.join(', ')}


    - <@&1056917546659483735> (${dptTrainingMembers.length}/∞): ${dptTrainingMembers.length == 0 ? "*N/A*" : dptTrainingMembers.join(', ')}
    
    `

    await effChannel.send({ embeds: [
        new EmbedBuilder()
            .setColor("0x056500")
            .setTitle("Effectifs")
            .setDescription(embedContent)
            .setFooter({ text: "Pine County Sheriff's Department", iconURL: "https://i.imgur.com/gxWkNhH.png" })
    ]});

};