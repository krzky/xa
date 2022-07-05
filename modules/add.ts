import chalk from "chalk";
import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization";
import CONFIG from "../config";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import format from "string-format";
import fs from 'fs';
const ADD = STRINGS.add;

module.exports = {
    name: "add",
    description: ADD.DESCRIPTION,
    extendedDescription: ADD.EXTENDED_DESCRIPTION,
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
            if (!args[0]) {
                client.sendMessage(
                    XA.chatId,
                    ADD.NO_ARG_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            let number;
            if (parseInt(args[0]) === NaN || args[0][0] === "+" || args[0].length < 10) {
                client.sendMessage(
                    XA.chatId,
                    ADD.NUMBER_SYNTAX_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            if (args[0].length == 10 && !(parseInt(args[0]) === NaN)) {
                number = CONFIG.COUNTRY_CODE + args[0];
            } else {
                number = args[0];
            }
            const [exists] = await client.sock.onWhatsApp(
                number + "@s.whatsapp.net"
            );
            if (!(exists)) {
                client.sendMessage(
                    XA.chatId,
                    format(ADD.NOT_ON_WHATSAPP, number),
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            const response: any = await client.sock.groupParticipantsUpdate(XA.chatId, [number + "@s.whatsapp.net"], 'add');

            // if (response[number + "@c.us"] == 408) {
            //     client.sendMessage(
            //         XA.chatId,
            //         ADD.NO_24HR_BAN,
            //         MessageType.text
            //     ).catch(err => inputSanitization.handleError(err, client, XA));
            //     return;
            // } else if (response[number + "@c.us"] == 403) {
            //     for (const index in response.participants) {
            //         if ((number + "@c.us") in response.participants[index]) {
            //             var code = response.participants[index][number + "@c.us"].invite_code;
            //             var tom = response.participants[index][number + "@c.us"].invite_code_exp;
            //         }
            //     }
            //     var invite = {
            //         caption: "```Hi! You have been invited to join this WhatsApp group by XA!```\n\n🔗https://myXA.com",
            //         groupJid: XA.groupId,
            //         groupName: XA.groupName,
            //         inviteCode: code,
            //         inviteExpiration: tom,
            //         jpegThumbnail: fs.readFileSync('./images/XA_invite.jpeg')
            //     }
            //     await client.sendMessage(
            //         number + "@s.whatsapp.net",
            //         invite,
            //         MessageType.groupInviteMessage
            //     );
            //     client.sendMessage(
            //         XA.chatId,
            //         ADD.PRIVACY,
            //         MessageType.text
            //     ).catch(err => inputSanitization.handleError(err, client, XA));
            //     return;
            // } else if (response[number + "@c.us"] == 409) {
            //     client.sendMessage(
            //         XA.chatId,
            //         ADD.ALREADY_MEMBER,
            //         MessageType.text
            //     ).catch(err => inputSanitization.handleError(err, client, XA));
            //     return;
            // }
            client.sendMessage(
                XA.chatId,
                "```" + number + ADD.SUCCESS + "```",
                MessageType.text
            );
        } catch (err) {
            if (err.status == 400) {
                await inputSanitization.handleError(
                    err,
                    client,
                    XA,
                    ADD.NOT_ON_WHATSAPP
                ).catch(err => inputSanitization.handleError(err, client, XA));
            }
            await inputSanitization.handleError(err, client, XA);
        }
        return;
    },
};
