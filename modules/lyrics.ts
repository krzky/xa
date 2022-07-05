import Client from "../sidekick/client.js";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";
import got, {Response} from "got";
import inputSanitization from "../sidekick/input-sanitization";
import STRINGS from "../lib/db";

const songlyrics = require("songlyrics").default;

module.exports = {
    name: "lyrics",
    description: STRINGS.lyrics.DESCRIPTION,
    extendedDescription: STRINGS.lyrics.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".lyrics Stairway to heaven" },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        const processing: proto.WebMessageInfo = await client.sendMessage(
            XA.chatId,
            STRINGS.lyrics.PROCESSING,
            MessageType.text
        );
        try {
            var song: string = "";
            if (XA.isTextReply) {
                song = XA.replyMessage;
            } else if (args.length == 0) {
                client.sendMessage(
                    XA.chatId,
                    STRINGS.lyrics.NO_ARG,
                    MessageType.text
                );
                return;
            } else {
                song = args.join(" ");
            }
            let Response: Response<string> = await got(
                `https://some-random-api.ml/lyrics/?title=${song}`
            );
            let data = JSON.parse(Response.body);
            let caption: string =
                "*Title :* " +
                data.title +
                "\n*Author :* " +
                data.author +
                "\n*Lyrics :*\n" +
                data.lyrics;

            try {
                await client.sendMessage(
                    XA.chatId,
                    { url: data.thumbnail.genius },
                    MessageType.image,
                    {
                        caption: caption,
                    }
                );
            } catch (err) {
                client.sendMessage(XA.chatId, caption, MessageType.text);
            }
            await client.deleteMessage(XA.chatId, {
                id: processing.key.id,
                remoteJid: XA.chatId,
                fromMe: true,
            });
            // return;
        } catch (err) {
            try{
                let data = await songlyrics(song)
                let caption: string =
                    "*Title :* " +
                    song +
                    "\n*Source :* " +
                    data.source.link +
                    "\n*Lyrics :*\n" +
                    data.lyrics;
    
                await client.sendMessage(XA.chatId, caption, MessageType.text);
                await client.deleteMessage(XA.chatId, {
                    id: processing.key.id,
                    remoteJid: XA.chatId,
                    fromMe: true,
                });
            }catch(err){
                await inputSanitization.handleError(
                    err,
                    client,
                    XA,
                    STRINGS.lyrics.NOT_FOUND
                );
                return await client.deleteMessage(XA.chatId, {
                    id: processing.key.id,
                    remoteJid: XA.chatId,
                    fromMe: true,
                });
            }
        }
    },
};
