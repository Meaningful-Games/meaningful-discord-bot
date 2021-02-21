const fetch = require("node-fetch")
const { prefix, token } = require("./config.json");

const Discord = require("discord.js");
const client = new Discord.Client();

// Function Modules
const PollEmbed = require("./functions/poll");
const pollEmbed = require("./functions/poll");

const pollmasterID = "444514223075360800";

let waitingForReply = false;

client.once("ready", () => {
    console.log("ready!");
    client.user.setActivity("Meaningful People", { type: "WATCHING"})
});

client.on("message", messageHandler);

client.login(token);

async function messageHandler(message) {
    // DMs
    if (message.channel.type == "dm" && (!message.author.bot || message.author.id == pollmasterID)) {
        message.author.send("You are DMing me now!");
        console.log(message.content)
        return;
    }

    // Commands on servers
    if (message.content.startsWith(prefix) || !message.author.bot ) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === "report") {
            if (args.length < 1) {
                message.channel.send("Need atleast 2 arguments");
                return
            }
            
            const channelId = args[0].match(/\d+/)[0];
            const channel = client.channels.cache.get(channelId);

            let messageToSend = "No Message Specified";

            if (channel) {
                messageToSend = await getReportText(args[1]);
                console.log(messageToSend)
                client.channels.cache.get(channelId).send(messageToSend);
            }
            else {
                message.channel.send("Invalid Channel ID!");
            }
        } else if (command === "poll") {
            let currUser = message.author;
            let pollData = {}

            await message.channel.send("What is the question of the poll?");
            try {
                let collected = await message.channel.awaitMessages(msg => msg.author.id === currUser.id, { max: 1, time: 60000, errors: ['time'] });
                pollData.title = collected.first().content;

                await message.channel.send("> Enter the options for the poll:\n> *Ex, One, Two, Three*");
                let collOptions = await message.channel.awaitMessages(msg => msg.author.id === currUser.id, { max: 1, time: 60000, errors: ['time'] })
                let optionMessage = collOptions.first().content;
                pollData.options = optionMessage.split(",").map(text => text.trim());

                await message.channel.send("> How long should the poll last(in minutes)?")
                let timeOptions = await message.channel.awaitMessages(msg => msg.author.id === currUser.id, { max: 1, time: 60000, errors: ['time'] })
                pollData.time = timeOptions.first().content.match(/\d+/)[0] * 60;

                pollEmbed(message, pollData.title, pollData.options, pollData.time)
            } catch(err) {
                console.log(err);
                message.channel.send("Something went wrong!")
            }
    }
    if (message.author.id == pollmasterID) {
        console.log("pollmaster texted")
        message.awaitReactions(reactionFilter, { time: 2000, errors: ["time"] })
            .then(collected => console.log(collected.size))
            .catch(collected => {
                console.log("Number of reactions: ", collected.size);
                if (collected.size > 0) message.react("📎");
            })
    }
}
}

// Utility Functions

async function getReportText(url) {
    res = await fetch(url);
    text = await res.text();
    return `\`\`\`${text}\`\`\``;
}

function reactionFilter(reaction, user) {
    return reaction.emoji.name === "📎" && user.id === pollmasterID;
}