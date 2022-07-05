import inputSanitization from "../sidekick/input-sanitization";
import fs from "fs";
import Strings from "../lib/db";
import Client from "../sidekick/client.js";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";
const GETDP = Strings.getdp;

module.exports = {
    name: "getdp",
    description: GETDP.DESCRIPTION,
    extendedDescription: GETDP.EXTENDED_DESCRIPTION,
    demo: { isEnabled: true, text: ".getdp" },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            let url: string;
            if (!args[0]) {
                url = await client.sock.profilePictureUrl(XA.chatId);
            } else {
                let jid: string = args[0].split("@")[1] + "@s.whatsapp.net";
                url = await client.sock.profilePictureUrl(jid);
            }

            await client.sendMessage(
                XA.chatId,
                { url: url },
                MessageType.image,
                {
                    caption: GETDP.IMAGE_CAPTION
                }
            );
            return
        } catch (err) {
            if (err.data === 404 || err.data === 401) {
                await client.sendMessage(
                    XA.chatId,
                    fs.readFileSync("./images/default_dp.png"),
                    MessageType.image,
                    {
                        caption: "```Gagal mengambil foto karena pp nya ga ada kaya orang depresi 😭```",
                    }
                );
            } else {
                await inputSanitization.handleError(err, client, XA);
            }

            return
        }
    },
};
