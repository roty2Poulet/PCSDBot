const { EmbedBuilder } = require("discord.js");

module.exports.execute = (PCSDGuild, db) => {
    const today = new Date();

    if (today.getDay() == 0) {
        const secondsNow = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds()
        const midnightInSeconds = 86400;

        setTimeout(async () => {
            const rawData = await db.getData("/prisesDeService");
            await db.delete("/prisesDeService");
            await db.push("/prisesDeService", []);

            await rawData.sort((a, b) => PCSDGuild.members.cache.get(b.memberID).roles.highest.position - PCSDGuild.members.cache.get(a.memberID).roles.highest.position);

            let embedContent = "";

            rawData.forEach(member => {
                for (let index in member.daysOfWork) {
                    switch(member.daysOfWork[index]) {
                        case 0:
                            member.daysOfWork[index] = "Dimanche";
                            break;
                        case 1:
                            member.daysOfWork[index] = "Lundi";
                            break;
                        case 2:
                            member.daysOfWork[index] = "Mardi";
                            break;
                        case 3:
                            member.daysOfWork[index] = "Mercredi";
                            break;
                        case 4:
                            member.daysOfWork[index] = "Jeudi";
                            break;
                        case 5:
                            member.daysOfWork[index] = "Vendredi";
                            break;
                        case 6:
                            member.daysOfWork[index] = "Samedi";
                            break;
                        default:
                            break;
                    }
                }
                const str = 
                `<@${member.memberID}>: ${member.daysOfWork.join(", ")}
                \n`;
                embedContent = embedContent + str;
            });

            if (embedContent === "") { embedContent = " " }

            const mondayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

            await PCSDGuild.channels.cache.get("1095974574887288982").send({ embeds: [
                new EmbedBuilder()
                    .setTitle(`Rapport de service de la semaine du ${mondayDate.getDate()}/${mondayDate.getMonth() + 1}/${mondayDate.getFullYear()}`)
                    .setColor("0x056500")
                    .setDescription(embedContent)
                    .setFooter({ text: "Pine County Sheriff's Department", iconURL: "https://i.imgur.com/gxWkNhH.png"})
            ]});

        }, (midnightInSeconds - secondsNow) * 1000);
    } else return
};