const { ChannelType } = require("discord.js");

module.exports.execute = async (Member, Guild, db) => {

    if (!Guild.available) { return }

    const nbOfVC = await db.count("/channels/");

    let createdChannelInfo = [];

    await Guild.channels.create({
        name: `📻╿𝗥𝗮𝗱𝗶𝗼 ${nbOfVC + 1}`,
        type: ChannelType.GuildVoice
    }).then(async (channel) => {
        await channel.setParent("1056917547305410574");

        await channel.lockPermissions();

        createdChannelInfo = [{
            channelID: channel.id,
            ownerID: Member.id
        }];

        await db.push("/channels/", createdChannelInfo, false);
    }).catch(err => {
        console.error(err);
        return
    });

    try {

        await Member.voice.setChannel(createdChannelInfo[0].channelID, "Normal voice channel creation processing"); 
        // INFO: createChannel[0].id is the channel's ID

    } catch {

        const channel = Guild.channels.cache.get("1058009600034615366");

        channel.send(`No fatal error: Member ${Member.nickname} has just tried to make the bot crash !`);

    }
};