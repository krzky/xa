import inputSanitization from "../sidekick/input-sanitization";
import String from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const REPLY = String.demote;

module.exports = {
    name: "demote",
    description: REPLY.DESCRIPTION,
    extendedDescription: REPLY.EXTENDED_DESCRIPTION,
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            if (!XA.isGroup) {
                client.sendMessage(
                    XA.chatId,
                    REPLY.NOT_A_GROUP,
                    MessageType.text
                );
                return;
            }
            await client.getGroupMetaData(XA.chatId, XA);
            if (!XA.isBotGroupAdmin) {
                client.sendMessage(
                    XA.chatId,
                    REPLY.BOT_NOT_ADMIN,
                    MessageType.text
                );
                return;
            }
            if (!XA.isTextReply && typeof args[0] == "undefined") {
                client.sendMessage(
                    XA.chatId,
                    REPLY.MESSAGE_NOT_TAGGED,
                    MessageType.text
                );
                return;
            }

            const reply = chat.message.extendedTextMessage;
            if (XA.isTextReply) {
                var contact = reply.contextInfo.participant.split("@")[0];
            } else {
                var contact = await inputSanitization.getCleanedContact(
                    args,
                    client,
                    XA
                );
            }
            var admin = false;
            var isMember = await inputSanitization.isMember(
                contact,
                XA.groupMembers
            );
            var owner = false;
            for (const index in XA.groupMembers) {
                if (contact == XA.groupMembers[index].id.split("@")[0]) {
                    console.log(XA.groupMembers[index]);
                    owner = XA.groupMembers[index].admin === 'superadmin';
                    admin = XA.groupMembers[index].admin != undefined;
                }
            }

            if (owner) {
                client.sendMessage(
                    XA.chatId,
                    "*" + contact + " is the owner of the group*",
                    MessageType.text
                );
                return;
            }

            if (isMember) {
                if (admin) {
                    const arr = [contact + "@s.whatsapp.net"];
                    await client.sock.groupParticipantsUpdate(XA.chatId, arr, 'demote');
                    client.sendMessage(
                        XA.chatId,
                        "*" + contact + " is demoted from admin*",
                        MessageType.text
                    );
                    return;
                } else {
                    client.sendMessage(
                        XA.chatId,
                        "*" + contact + " was not an admin*",
                        MessageType.text
                    );
                    return;
                }
            }
            if (!isMember) {
                if (contact === undefined) {
                    return;
                }

                client.sendMessage(
                    XA.chatId,
                    REPLY.PERSON_NOT_IN_GROUP,
                    MessageType.text
                );
                return;
            }
            return;
        } catch (err) {
            if (err === "NumberInvalid") {
                await inputSanitization.handleError(
                    err,
                    client,
                    XA,
                    "```Invalid number ```" + args[0]
                );
            } else {
                await inputSanitization.handleError(err, client, XA);
            }
        }
    },
};
