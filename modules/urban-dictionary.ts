import got from "got";
import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db";
import format from "string-format";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import ud from "urban-dictionary";

module.exports = {
    name: "ud",
    description: STRINGS.ud.DESCRIPTION,
    extendedDescription: STRINGS.ud.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".ud bruh" },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        const processing = await client.sendMessage(
            XA.chatId,
            STRINGS.ud.PROCESSING,
            MessageType.text
        );
        try {
            var text: string = "";
            if (args.length == 0) {
                client.sendMessage(
                    XA.chatId,
                    STRINGS.ud.NO_ARG,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            } else {
                text = args.join(" ");
            }

            let Response = await ud.define(text);
            console.log(Response);
            let result = Response.reduce(function (prev, current) {
                return prev.thumbs_up + prev.thumbs_down >
                    current.thumbs_up + current.thumbs_down
                    ? prev
                    : current;
            });

            result.definition = result.definition.replace(/\[/g, "_");
            result.definition = result.definition.replace(/\]/g, "_");
            result.example = result.example.replace(/\[/g, "_");
            result.example = result.example.replace(/\]/g, "_");

            let msg =
                "*Word :* " +
                result.word +
                "\n\n*Meaning :*\n" +
                result.definition +
                "\n\n*Example:*\n" +
                result.example +
                "\n〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\n👍" +
                result.thumbs_up +
                "  👎" +
                result.thumbs_down;

            await client.deleteMessage(XA.chatId, {
                id: processing.key.id,
                remoteJid: XA.chatId,
                fromMe: true,
            });

            await client.sendMessage(XA.chatId, msg, MessageType.text).catch(err => inputSanitization.handleError(err, client, XA));
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                XA,
                format(STRINGS.ud.NOT_FOUND, text)
            );
            return await client.deleteMessage(XA.chatId, {
                id: processing.key.id,
                remoteJid: XA.chatId,
                fromMe: true,
            });
        }
        return;
    },
};
