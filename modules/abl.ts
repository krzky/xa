import Strings from "../lib/db";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization";
import Blacklist from "../database/blacklist";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const abl = Strings.abl;

module.exports = {
    name: "abl",
    description: abl.DESCRIPTION,
    extendedDescription: abl.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".abl" },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            if (XA.isPm && XA.fromMe) {
                let PersonToBlacklist = XA.chatId;
                Blacklist.addBlacklistUser(PersonToBlacklist, "");
                client.sendMessage(
                    XA.chatId,
                    format(abl.PM_ACKNOWLEDGEMENT, PersonToBlacklist.substring(0, PersonToBlacklist.indexOf("@"))),
                    MessageType.text
                );
                return;
            } else {
                await client.getGroupMetaData(XA.chatId, XA);
                if (args.length > 0) {
                    let PersonToBlacklist = await inputSanitization.getCleanedContact(
                        args,
                        client,
                        XA);
                    if (PersonToBlacklist === undefined) return;
                    PersonToBlacklist += "@s.whatsapp.net";
                    if (XA.owner === PersonToBlacklist) {
                        client.sendMessage(
                            XA.chatId,
                            abl.CAN_NOT_BLACKLIST_BOT,
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.addBlacklistUser(
                        PersonToBlacklist,
                        XA.chatId
                    );
                    client.sendMessage(
                        XA.chatId,
                        format(abl.GRP_ACKNOWLEDGEMENT, PersonToBlacklist.substring(0, PersonToBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else if (XA.isTextReply) {
                    let PersonToBlacklist = XA.replyParticipant;
                    if (XA.owner === PersonToBlacklist) {
                        client.sendMessage(
                            XA.chatId,
                            abl.CAN_NOT_BLACKLIST_BOT,
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.addBlacklistUser(
                        PersonToBlacklist,
                        XA.chatId
                    );
                    client.sendMessage(
                        XA.chatId,
                        format(abl.GRP_ACKNOWLEDGEMENT, PersonToBlacklist.substring(0, PersonToBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else {
                    Blacklist.addBlacklistUser("", XA.chatId);
                    client.sendMessage(
                        XA.chatId,
                        format(abl.GRP_BAN, XA.groupName),
                        MessageType.text
                    );
                    return;
                }
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, XA);
        }
    },
};
