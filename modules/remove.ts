import chalk from "chalk";
import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";

module.exports = {
    name: "remove",
    description: STRINGS.remove.DESCRIPTION,
    extendedDescription: STRINGS.remove.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            if (!XA.isGroup) {
                client.sendMessage(
                    XA.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            await client.getGroupMetaData(XA.chatId, XA);
            if (!XA.isBotGroupAdmin) {
                client.sendMessage(
                    XA.chatId,
                    STRINGS.general.BOT_NOT_ADMIN,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            let owner: string;
            for (const index in XA.groupMembers) {
                if (XA.groupMembers[index].admin === 'superadmin') {
                    owner = XA.groupMembers[index].id.split("@")[0];
                }
            }
            if (XA.isTextReply) {
                let PersonToRemove =
                    chat.message.extendedTextMessage.contextInfo.participant;
                if (PersonToRemove === owner + "@s.whatsapp.net") {
                    client.sendMessage(
                        XA.chatId,
                        "*" + owner + " is the owner of the group*",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, XA));
                    return;
                }
                if (PersonToRemove === XA.owner) {
                    client.sendMessage(
                        XA.chatId,
                        "```Why man, why?! Why would you use my powers to remove myself from the group?!🥺```\n*Request Rejected.* 😤",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, XA));
                    return;
                }
                var isMember = inputSanitization.isMember(
                    PersonToRemove,
                    XA.groupMembers
                );
                if (!isMember) {
                    client.sendMessage(
                        XA.chatId,
                        "*person is not in the group*",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, XA));
                }
                try {
                    if (PersonToRemove) {
                        await client.sock.groupParticipantsUpdate(XA.chatId, [PersonToRemove], 'remove').catch(err => inputSanitization.handleError(err, client, XA));
                        return;
                    }
                } catch (err) {
                    throw err;
                }
                return;
            }
            if (!args[0]) {
                client.sendMessage(
                    XA.chatId,
                    STRINGS.remove.INPUT_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            if (args[0][0] == "@") {
                const number = args[0].substring(1);
                if (parseInt(args[0]) === NaN) {
                    client.sendMessage(
                        XA.chatId,
                        STRINGS.remove.INPUT_ERROR,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, XA));
                    return;
                }

                if((number + "@s.whatsapp.net") === XA.owner){
                    client.sendMessage(
                        XA.chatId,
                        "```Why man, why?! Why would you use my powers to remove myself from the group?!🥺```\n*Request Rejected.* 😤",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, XA));
                    return;
                }

                if (!(number === owner)) {
                    await client.sock.groupParticipantsUpdate(XA.chatId, [number + "@s.whatsapp.net"], 'remove').catch(err => inputSanitization.handleError(err, client, XA));
                    return;
                } else {
                    client.sendMessage(
                        XA.chatId,
                        "*" + owner + " is the owner of the group*",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, XA));
                    return;
                }
            }
            client.sendMessage(
                XA.chatId,
                STRINGS.remove.INPUT_ERROR,
                MessageType.text
            ).catch(err => inputSanitization.handleError(err, client, XA));
        } catch (err) {
            await inputSanitization.handleError(err, client, XA);
            return;
        }
    },
};
