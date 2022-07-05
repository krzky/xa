import Strings from "../lib/db";
const ADMINS = Strings.admins;
import inputSanitization from "../sidekick/input-sanitization";
import Client from "../sidekick/client.js";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";

module.exports = {
    name: "admins",
    description: ADMINS.DESCRIPTION,
    extendedDescription: ADMINS.EXTENDED_DESCRIPTION,
    demo: { text: ".admins", isEnabled: true },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            if (!XA.isGroup) {
                client.sendMessage(
                    XA.chatId,
                    ADMINS.NOT_GROUP_CHAT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }

            let message: string = "";
            await client.getGroupMetaData(XA.chatId, XA);
            for (let admin of XA.groupAdmins) {
                let number: string = admin.split("@")[0];
                message += `@${number} `;
            }

            client.sendMessage(XA.chatId, message, MessageType.text, {
                contextInfo: {
                    mentionedJid: XA.groupAdmins,
                },
            }).catch(err => inputSanitization.handleError(err, client, XA));
            return;
        } catch (err) {
            await inputSanitization.handleError(err, client, XA);
        }
    },
};
