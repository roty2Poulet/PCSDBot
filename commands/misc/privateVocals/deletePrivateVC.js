module.exports.execute = async (Member, Guild, db) => {
    const dbID = await db.getIndex("/channels", Member.id, "ownerID");

    if (dbID === -1) { return }

    const dbData = await db.getData("/channels");

    const channelIDToDestroy = dbData[dbID].channelID;
    
    Guild.channels.delete(channelIDToDestroy);

    db.delete(`/channels[${dbID}]`);
};