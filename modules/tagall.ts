import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db.js";
import Client from "../sidekick/client.js";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";

module.exports = {
    name: "tagall",
    description: STRINGS.tagall.DESCRIPTION,
    extendedDescription: STRINGS.tagall.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".tagall",
            ".tagall Hey everyone! You have been tagged in this message hehe.",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            if(XA.chatId === "917838204238-1632576208@g.us"){
                return; // Disable this for Spam Chat
            }
            if (!XA.isGroup) {
                client.sendMessage(
                    XA.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            await client.getGroupMetaData(XA.chatId, XA);
            console.log(XA);
            let members = [];
            for (var i = 0; i < XA.groupMembers.length; i++) {
                members[i] = XA.groupMembers[i].id;
            }
            if (XA.isTextReply) {
                client.sendMessage(
                    XA.chatId,
                    STRINGS.tagall.TAG_MESSAGE,
                    MessageType.text,
                    {
                        contextInfo: {
                            stanzaId: XA.replyMessageId,
                            participant: XA.replyParticipant,
                            quotedMessage: {
                                conversation: XA.replyMessage,
                            },
                            mentionedJid: members,
                        },
                    }
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            if (args.length) {
                client.sendMessage(
                    XA.chatId,
                    args.join(" "),
                    MessageType.text,
                    {
                        contextInfo: {
                            mentionedJid: members,
                        },
                    }
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }

            client.sendMessage(
                XA.chatId,
                STRINGS.tagall.TAG_MESSAGE,
                MessageType.text,
                {
                    contextInfo: {
                        mentionedJid: members,
                    },
                }
            ).catch(err => inputSanitization.handleError(err, client, XA));
        } catch (err) {
            await inputSanitization.handleError(err, client, XA);
        }
        return;
    },
};
