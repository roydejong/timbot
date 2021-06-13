const ElizaHelper = require('../twitch/eliza.js');
const axios = require('axios');
var moment = require('moment');

module.exports = (client, args, Discord) => {
    let selloutList = [];

    axios.get("https://twitch.center/customapi/quote/list?token=a912f99b")
    .then((res) => {
        let data = res.data;
        let lines = data.split("\n");

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            selloutList.push(line);
        }

        console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][Sellout]', `Sellout list initialized from remote, ${selloutList.length} items`);
    });

    let selloutCheckTs = 0;
    let selloutTimeout = null;

    let doSelloutMessage = (channel) => {
        if (!selloutList.length) {
            return;
        }

        let randomLine = selloutList[Math.floor(Math.random()*selloutList.length)];

        if (!randomLine) {
            return;
        }

        let messageText = "Oh. I guess nightbot is out drinking again. I got this. ";
        messageText += "How many quality Amazon™ products are there? At least ";
        messageText += randomLine;

        try {
            channel.send(messageText);
            channel.stopTyping(true);
        } catch (e) {
            console.error('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][Sellout] ERR:', e.toString());
        }
    };
    //Commands
    let lastTextReplyAt = 0;

    client.on('message', message => {
        if (!message.content) {
            // Empty message
            return;
        }
    
        let txtPlain = message.content.toString().trim();
        let txtLower = txtPlain.toLowerCase();
    
        if (!txtLower.length) {
            // Whitespace or blank message
            return;
        }
    
        let txtNoPunct = txtLower;
        txtNoPunct = txtNoPunct.replace(",", " ");
        txtNoPunct = txtNoPunct.replace(".", " ");
        txtNoPunct = txtNoPunct.replace("?", " ");
        txtNoPunct = txtNoPunct.replace("!", " ");
        txtNoPunct = txtNoPunct.replace("'", "");
        txtNoPunct = txtNoPunct.replace(`"`, "");
        txtNoPunct = txtNoPunct.replace("  ", " ");
        txtNoPunct = txtNoPunct.trim();

        if (txtLower === "!sellout" || txtLower.indexOf("amazon.com") >= 0 || txtLower.indexOf("amzn.to") >= 0) {
            // An amazon link was posted, or a new !sellout was called
            // (either way we bail - we don't want duplicates or spam)
            if (selloutTimeout) {
                clearTimeout(selloutTimeout);
                selloutTimeout = null;
    
                try {
                    message.channel.stopTyping(true);
                } catch (e) { }
            }
    
            // We need to make sure we're listening for bots posting links too, obviously, so this code lives pre-botcheck
        }
    
        if (message.author.bot) {
            // Bot message
            // As a courtesy, we ignore all messages from bots (and, therefore, ourselves) to avoid any looping or spamming
            return;
        }
    
        let now = Date.now();
    
        try {
            // Determine individual words that were part of this message
            let txtWords = txtNoPunct.split(' ');
    
            // Determine the names of any users mentioned
            let mentionedUsernames = [];
    
            message.mentions.users.forEach((user) => {
                mentionedUsernames.push(user.username);
            });
    
            // Determine whether *we* were mentioned
            let timbotWasMentioned = (txtWords.indexOf("timbot") >= 0 || mentionedUsernames.indexOf("Timbot") >= 0);
            let elizaWasMentioned = (txtWords.indexOf("eliza") >= 0);
            let elizaWasOn = ElizaHelper.isActiveForUser(message.author);
            let elizaModeOn = (elizaWasMentioned || elizaWasOn);

            // Anti spam timer
            let lastTextReply = lastTextReplyAt || 0;
            let minutesSinceLastTextReply = Math.floor(((Date.now() - lastTextReply) / 1000) / 60);
            let okayToTextReply = (minutesSinceLastTextReply >= 1);
    
            let fnTextReply = function (txt, force, asNormal) {
                if (okayToTextReply || force) {
                    try {
                        if (asNormal) {
                            message.channel.send(txt);
                        } else {
                            message.reply(txt);
                        }
    
                        lastTextReplyAt = now;
                    } catch (e) {
                        console.error('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][Chat]', 'Reply error:', e)
                    }
                }
    
                try {
                    message.channel.stopTyping();
                } catch (e) { }
    
                return true;
            };
    
            // Nightbot / !sellout helper
            if (txtLower === "!sellout" || (timbotWasMentioned && txtLower.indexOf("!sellout") >= 0)) {
                // Do a new sellout (either the "!sellout" command was used or someone mentioned "timbot" and "!sellout" together)
                message.channel.startTyping();

                selloutTimeout = setTimeout(() => {
                    doSelloutMessage(message.channel);
                }, 3500);

                return;
            }

            let relationshipPlusEmoji = getServerEmoji("timPlus", false);
            let relationshipMinusEmoji = getServerEmoji("timMinus", false);

            // Timbot mentions
            if (timbotWasMentioned || elizaWasMentioned) {
                // --- Eliza start ---
                if (elizaModeOn) {
                    let isEnding = txtNoPunct.indexOf("goodbye") >= 0 || txtNoPunct.indexOf("good bye") >= 0;
                    let isStarting = !isEnding && !elizaWasOn;

                    message.channel.startTyping();

                    if (isEnding) {
                        ElizaHelper.end(message);
                    } else if (isStarting) {
                        ElizaHelper.start(message);
                    } else {
                        ElizaHelper.reply(message);
                    }

                    return;
                }
                // --- Eliza eof ---

                let isNegative = (txtWords.indexOf("not") >= 0 || txtLower.indexOf("n't") >= 0 ||
                    txtWords.indexOf("bad") >= 0);
        
                // General mention -----------------------------------------------------------------------------------------

                if (cleverbot) {
                    message.channel.startTyping();

                    let cleverInput = message.cleanContent;
                    console.log(cleverInput, message.member.user.discriminator);

                    cleverbot.say(cleverInput, message.member.user.discriminator)
                        .then((cleverOutput) => {
                            console.log(cleverOutput);
                            if (cleverOutput && cleverOutput.length) {
                                cleverOutput = cleverOutput.replaceAll("cleverbot", "Timbot");

                                fnTextReply(cleverOutput, true, true);
                            } else {
                                // No or blank response from CB
                                message.react("🤷");
                                message.channel.stopTyping(true);
                            }
                        })
                        .catch((err) => {
                            // Err, no CB response
                            console.log(err);
                            message.react("❌");
                            message.channel.stopTyping(true);
                        });
                }
            }

            // Food use integration
            if (txtLower.indexOf("food use") >= 0 || txtLower.indexOf("food dip") >= 0 ||
                txtLower.indexOf("fooddip") >= 0 || txtLower.indexOf("fooduse") >= 0) {
                let bobmoji = getServerEmoji("BOB_EATS");

                if (bobmoji) {
                    message.react(bobmoji);
                }
            }

            // Easter egg: meme
            if (txtLower.indexOf("loss") >= 0) {
                let lossEmoji = getServerEmoji("THINK_ABOUT_LOSS");

                if (lossEmoji) {
                    message.react(lossEmoji);
                }
            }

            if (txtLower.indexOf("meme") >= 0) {
                if (relationshipMinusEmoji) {
                    message.react(relationshipMinusEmoji);
                }
            }

            // Easter egg: timOh reaction
            if (txtNoPunct === "oh" || txtLower.startsWith("oh.")) {
                let ohEmoji = getServerEmoji("timOh", false);

                if (ohEmoji) {
                    message.react(ohEmoji);
                }
            }
        
            // Gay
            let gayWords = ["gay", "queer", "homo", "pride", "rainbow", "prideflag"];

            for (let i = 0; i < gayWords.length; i++) {
                let _gayWord = gayWords[i];

                if (txtLower.indexOf(_gayWord) >= 0) {
                    message.react("🏳️‍🌈");
                }
            }

            // Easter egg: timGuest420 reaction
            if (txtWords.indexOf("grass") >= 0 || txtLower.indexOf("420") >= 0
                || txtWords.indexOf("kush") >= 0 || txtWords.indexOf("weed") >= 0
                || txtLower.indexOf("aunt mary") >= 0 || txtWords.indexOf("ganja") >= 0
                || txtWords.indexOf("herb") >= 0 || txtWords.indexOf("joint") >= 0
                || txtWords.indexOf("juja") >= 0 || txtLower.indexOf("mary jane") >= 0
                || txtWords.indexOf("reefer") >= 0 || txtWords.indexOf("doobie") >= 0
                || txtWords.indexOf("cannabis") >= 0 || txtLower.indexOf("magic brownie") >= 0
                || txtWords.indexOf("bong") >= 0 || txtNoPunct.indexOf("devils lettuce") >= 0
                || txtLower.indexOf("marijuana") >= 0 || txtLower.indexOf("dime bag") >= 0
                || txtWords.indexOf("dimebag") >= 0 || txtWords.indexOf("toke") >= 0
                || txtWords.indexOf("blaze") >= 0 || txtWords.indexOf("blunt") >= 0
            ) {
                let fourtwentyEmoji = getServerEmoji("timGuest420", false);

                if (fourtwentyEmoji) {
                    message.react(fourtwentyEmoji);
                }
            }
        
            //Meep
            if (txtWords.indexOf("meep") >= 0 ) {
                message.channel.send("Meep!");
            }

            // 4head
            if (txtWords.indexOf('4head') >= 0) {
                let fourheadEmoji = getServerEmoji("4head", false);

                if (fourheadEmoji) {
                    message.react(fourheadEmoji);
                }
            }

            // haha
            let hahaWords = ["haha", "hehe"];

            for (let i = 0; i < hahaWords.length; i++) {
                let _hahaWord = hahaWords[i];

                if (txtLower.indexOf(_hahaWord) >= 0) {
                    message.react("😆");
                }
            }
        
            // beat saber
            if (txtWords.indexOf('beatsaber') >= 0 || txtLower.indexOf('beat saber') >= 0) {
                let beatsaberEmoji = getServerEmoji("beatsaber", false);
    
                if (beatsaberEmoji) {
                    message.react(beatsaberEmoji);
                }
            }
        
            // clap
            if (txtWords.indexOf('clap') >= 0) {
                let clapEmoji = getServerEmoji("ClapClap", false);

                if (clapEmoji) {
                    message.react(clapEmoji);
                }
            }
        } catch (e) {
            console.error('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][Chat]', 'Message processing / dumb joke error:', e, `<<< ${e.toString()} >>>`);
        }
    });
}
