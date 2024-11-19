const fs = require("fs");
const commandrandomizer = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = async (client, message) => {
    if (client.global.paused || client.global.captchadetected) return;
    
    let channel = client.channels.cache.get(client.basic.commandschannelid);
    if (client.config.settings.owoprefix.length <= 0) {
        client.config.settings.owoprefix = "owo";
    }
    
    if (client.basic.commands.checklist) {
        checklist(client, channel);
    } else {
        await client.delay(2000);
        require("./function/farm.js")(client, message);
    }
    
    await client.delay(2000);
    
    await client.delay(16000); //reduce bot rate
    if (client.basic.commands.gamble.coinflip ||
        client.basic.commands.gamble.slot) require("./function/gamble.js")(client, message);
    
    await client.delay(8000);
    if (client.basic.commands.autoquest) require("./function/quest.js")(client, message);
    else client.global.quest.title = "Quest not enabled";
    
    await client.delay(16000);
    if (client.basic.commands.animals) sell(client,
        channel,
        client.config.animals.type.sell ? "sell" : "sacrifice",
        client.global.temp.animaltype);
    
    await client.delay(32000);
    require("./function/luck.js")(client, message);
};

async function checklist(client, channel) {
    if (client.global.captchadetected || client.global.paused) return;
    let id;
    await channel
        .send({
            content: `${commandrandomizer([
                "owo",
                client.config.settings.owoprefix,
            ])} ${commandrandomizer(["cl", "checklist"])}`,
        })
        .then(async (clmsg) => {
            client.global.checklist = true;
            id = clmsg.id;
            client.logger.info(
                "Farm",
                "Checklist",
                `Paused: ${client.global.checklist}! Reading Checklist`
            );
            let message = await getMessage();
            async function getMessage() {
                return new Promise((resolve) => {
                    const filter = (msg) =>
                        msg.embeds[0] &&
                        msg.embeds[0].author &&
                        msg.embeds[0].author.name.includes("Checklist") &&
                        msg.author.id === "408785106942164992" &&
                        msg.channel.id === channel.id &&
                        msg.id.localeCompare(id) > 0;
                        
                    const listener = (msg) => {
                        if (filter(msg)) {
                            clearTimeout(timer);
                            client.off("messageCreate", listener);
                            resolve(msg);
                        }
                    };
                    
                    const timer = setTimeout(() => {
                        client.logger.warn(
                            "Farm",
                            "Checklist",
                            "Rechecking checklist..."
                            );
                        client.off("messageCreate", listener);
                        const collector = channel.createMessageCollector({ filter, time: 11600});
                        collector.on("collect", (msg) => {
                            if (filter(msg)) {
                                collector.stop();
                                resolve(msg);
                            }
                        });
                        collector.on("end", () => resolve(null));
                    }, 10000);

                    client.on("messageCreate", listener);
                });
            }
            
            if (message == null) {
                client.global.checklist = false;
                client.logger.alert(
                    "Farm",
                    "Checklist",
                    "Cannot get checklist");
                require("./function/farm.js")(client, message);
                return;
            }
            
            await client.delay(2000);
            if (client.global.captchadetected || client.global.paused) return;
            let checklistmsg = message.embeds[0].description;
            if (checklistmsg.includes("☑️ 🎉")) {
                client.logger.info("Farm", "Checklist", "Checklist Completed");
            } else {
                const checklistlines = checklistmsg.trim().split("\n");
                checklistlines.forEach(async (line) => {
                    switch (true) {
                        case line.startsWith("⬛ 🎁") &&
                            client.config.settings.checklist.types.daily:
                            await client.delay(3000);
                            await channel
                                .send({
                                    content: `${commandrandomizer([
                                        "owo",
                                        client.config.settings.owoprefix,
                                    ])} daily`,
                                })
                                .then(() => {
                                    client.logger.info(
                                        "Farm",
                                        "Checklist - Daily",
                                        `Daily Claimed`
                                    );
                                });
                            await client.delay(3000);
                            break;

                        case line.startsWith("⬛ 📝") &&
                            client.config.settings.checklist.types.vote:
                            client.logger.info(
                                "Farm",
                                "Checklist - Vote",
                                `Platform: ${process.platform}`
                            );

                            let votebrowserexecute, executeCommand;

                            switch (process.platform) {
                                case "win32":
                                    votebrowserexecute = "start";
                                    executeCommand = (command) =>
                                        client.childprocess.exec(command);
                                    break;
                                case "darwin":
                                    votebrowserexecute = "open";
                                    executeCommand = (command) =>
                                        client.childprocess.spawn(command, [
                                            "https://top.gg/bot/408785106942164992/vote",
                                        ]);
                                    break;
                                case "android":
                                    return;
                                case "linux":
                                    votebrowserexecute = "xdg-open";
                                    executeCommand = (command) =>
                                        client.childprocess.spawn(command, [
                                            "https://top.gg/bot/408785106942164992/vote",
                                        ]);
                                    break;
                                default:
                                    client.logger.warn(
                                        "Farm",
                                        "Checklist - Vote",
                                        "Unsupported platform!"
                                    );
                                    return;
                            }

                            if (votebrowserexecute) {
                                client.logger.info(
                                    "Farm",
                                    "Checklist - Vote",
                                    "Opening Browser."
                                );
                                executeCommand(
                                    `${votebrowserexecute} https://top.gg/bot/408785106942164992/vote`
                                );
                            }
                            break;

                        case line.startsWith("⬛ 🍪") &&
                            client.config.settings.checklist.types.cookie:
                            await client.delay(3000);
                            await channel
                                .send({
                                    content: `${commandrandomizer([
                                        "owo",
                                        client.config.settings.owoprefix,
                                    ])} cookie <@408785106942164992>`,
                                })
                                .then(() => {
                                    client.global.temp.usedcookie = true;
                                    client.logger.info(
                                        "Farm",
                                        "Checklist - Cookie",
                                        `Cookie Sended`
                                    );
                                });
                            await client.delay(3000);
                            break;
                            
                        case line.startsWith("️☑️ 🍪"):
                            client.global.temp.usedcookie = true;
                            break;

                        case line.startsWith("☑️ 💎"):
                            client.logger.info("Farm", "Checklist", "Completed daily lootbox");
                            break;

                        case line.startsWith("☑️ ⚔"):
                            client.logger.info("Farm", "Checklist", "Completed daily crate");
                            break;
                    }
                });
            }
            await client.delay(2000);
            for (let i = 0; i < 1000; i++) {
                if (client.global.captchadetected === false) {
                    client.global.checklist = false;

                    break;
                }
                await client.delay(1000);
            }
            
            client.logger.info(
                "Farm",
                "Checklist",
                `Paused: ${client.global.checklist}`
            );
            require("./function/farm.js")(client, message);
        });
}

async function sell(client, channel, choose, types) {
    if (client.global.captchadetected || client.global.paused) return;
    await channel
        .send({
            content: `${commandrandomizer([
                "owo",
                client.config.settings.owoprefix,
            ])} ${choose} ${types}`,
        });
}