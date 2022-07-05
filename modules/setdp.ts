import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import inputSanitization from "../sidekick/input-sanitization";
import String from "../lib/db.js";
import Client from "../sidekick/client";
import { downloadContentFromMessage, proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { Transform } from "stream";
const REPLY = String.setdp;

module.exports = {
    name: "setdp",
    description: REPLY.DESCRIPTION,
    extendedDescription: REPLY.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            if (!XA.isGroup) {
                await client.sendMessage(
                    XA.chatId,
                    REPLY.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            if (!XA.isImage && !XA.isReplyImage) {
                await client.sendMessage(
                    XA.chatId,
                    REPLY.NOT_AN_IMAGE,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            var update = await client.sendMessage(
                XA.chatId,
                REPLY.ICON_CHANGED,
                MessageType.text
            );
            var imageId = chat.key.id;
            const fileName = "./tmp/change_pic" + imageId;
            if (XA.isImage) {
                const stream: Transform = await downloadContentFromMessage(chat.message.imageMessage, 'image');
                await inputSanitization.saveBuffer(fileName, stream);
            } else {
                const stream: Transform = await downloadContentFromMessage(chat.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, 'image');
                await inputSanitization.saveBuffer(fileName, stream);
            }

            const imagePath = "./tmp/image-" + imageId + ".png";
            ffmpeg(fileName)
                .outputOptions(["-y", "-vcodec png", "-s 500x500"])
                .videoFilters(
                    "scale=2000:2000:flags=lanczos:force_original_aspect_ratio=decrease:eval=frame,format=rgba,pad=2000:2000:(ow-iw)/2:(oh-ih)/2,setsar=1:1"
                )
                .save(imagePath)
                .on("end", async () => {
                    client.sock.updateProfilePicture(
                        XA.chatId,
                        fs.readFileSync(imagePath)
                    ).catch(err => inputSanitization.handleError(err, client, XA));

                    //Image and message deletion
                    inputSanitization.deleteFiles(fileName, imagePath);
                    return await client.deleteMessage(XA.chatId, {
                        id: update.key.id,
                        remoteJid: XA.chatId,
                        fromMe: true,
                    }).catch(err => inputSanitization.handleError(err, client, XA));
                });
        } catch (err) {
            await inputSanitization.handleError(err, client, XA);
        }
        return;
    },
};
