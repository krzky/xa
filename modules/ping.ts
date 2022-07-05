import inputSanitization from "../sidekick/input-sanitization";
import config from "../config";
import String from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import format from "string-format";
const PING = String.ping;

module.exports = {
    name: "ping",
    description: PING.DESCRIPTION,
    extendedDescription: PING.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            var start = new Date().getTime();
			await client.sendMessage(XA.chatId,'```Ping!```',MessageType.text);
			var end = new Date().getTime();
			await client.sendMessage(XA.chatId, "*Pong!* ```" + (end - start) + "ms```", MessageType.text);
        } catch (err) {
			await inputSanitization.handleError(err, client, XA);
		}
    },
};
