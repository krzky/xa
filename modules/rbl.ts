import Strings from "../lib/db";
import format from "string-format";
import inputSanitization from "../sidekick/input-sanitization";
import Blacklist from "../database/blacklist";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const rbl = Strings.rbl;

module.exports = {
    name: "rbl",
    description: rbl.DESCRIPTION,
    extendedDescription: rbl.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".rbl" },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            if (XA.isPm && XA.fromMe) {
                let PersonToRemoveFromBlacklist = XA.chatId;
                if (!(await Blacklist.getBlacklistUser(PersonToRemoveFromBlacklist, ""))) {
                    client.sendMessage(
                        XA.chatId,
                        format(rbl.NOT_IN_BLACKLIST, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                }
                Blacklist.removeBlacklistUser(PersonToRemoveFromBlacklist, "");
                client.sendMessage(
                    XA.chatId,
                    format(rbl.PM_ACKNOWLEDGEMENT, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                    MessageType.text
                );
                return;
            } else {
                await client.getGroupMetaData(XA.chatId, XA);
                if (args.length > 0) {
                    let PersonToRemoveFromBlacklist =
                        await inputSanitization.getCleanedContact(
                            args,
                            client,
                            XA
                        );

                    if (PersonToRemoveFromBlacklist === undefined) return;
                    PersonToRemoveFromBlacklist += "@s.whatsapp.net";
                    if (
                        !(await Blacklist.getBlacklistUser(
                            PersonToRemoveFromBlacklist,
                            XA.chatId
                        ))
                    ) {
                        client.sendMessage(
                            XA.chatId,
                            format(rbl.NOT_IN_BLACKLIST, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.removeBlacklistUser(
                        PersonToRemoveFromBlacklist,
                        XA.chatId
                    );
                    client.sendMessage(
                        XA.chatId,
                        format(rbl.GRP_ACKNOWLEDGEMENT, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else if (XA.isTextReply) {
                    let PersonToRemoveFromBlacklist = XA.replyParticipant;
                    if (
                        !(await Blacklist.getBlacklistUser(
                            PersonToRemoveFromBlacklist,
                            XA.chatId
                        ))
                    ) {
                        client.sendMessage(
                            XA.chatId,
                            format(rbl.NOT_IN_BLACKLIST, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.removeBlacklistUser(
                        PersonToRemoveFromBlacklist,
                        XA.chatId
                    );
                    client.sendMessage(
                        XA.chatId,
                        format(rbl.GRP_ACKNOWLEDGEMENT, PersonToRemoveFromBlacklist.substring(0, PersonToRemoveFromBlacklist.indexOf("@"))),
                        MessageType.text
                    );
                    return;
                } else {
                    if (
                        !(await Blacklist.getBlacklistUser("", XA.chatId))
                    ) {
                        client.sendMessage(
                            XA.chatId,
                            format(rbl.NOT_IN_BLACKLIST, XA.groupName),
                            MessageType.text
                        );
                        return;
                    }
                    Blacklist.removeBlacklistUser("", XA.chatId);
                    client.sendMessage(
                        XA.chatId,
                        format(rbl.GRP_BAN, XA.groupName),
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
