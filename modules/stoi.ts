import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import inputSanitization from "../sidekick/input-sanitization";
import Strings from "../lib/db";
import Client from "../sidekick/client";
import { downloadContentFromMessage, proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { Transform } from "stream";
const STOI = Strings.stoi;

module.exports = {
    name: "stoi",
    description: STOI.DESCRIPTION,
    extendedDescription: STOI.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        // Task starts here
        try {
            // Function to convert media to sticker
            const convertToImage = async (stickerId: string, replyChat: { message: proto.IStickerMessage; type: any; }) => {
                var downloading = await client.sendMessage(
                    XA.chatId,
                    STOI.DOWNLOADING,
                    MessageType.text
                );

                const fileName = "./tmp/convert_to_image-" + stickerId;
                const stream: Transform = await downloadContentFromMessage(replyChat.message, replyChat.type);
                await inputSanitization.saveBuffer(fileName, stream);
                const imagePath = "./tmp/image-" + stickerId + ".png";
                try {
                    ffmpeg(fileName)
                        .save(imagePath)
                        .on("error", function (err, stdout, stderr) {
                            inputSanitization.deleteFiles(fileName);
                            client.deleteMessage(XA.chatId, {
                                id: downloading.key.id,
                                remoteJid: XA.chatId,
                                fromMe: true,
                            });
                            throw err;
                        })
                        .on("end", async () => {
                            await client.sendMessage(
                                XA.chatId,
                                fs.readFileSync(imagePath),
                                MessageType.image,
                            ).catch(err => inputSanitization.handleError(err, client, XA));
                            inputSanitization.deleteFiles(fileName, imagePath);
                            return await client.deleteMessage(XA.chatId, {
                                id: downloading.key.id,
                                remoteJid: XA.chatId,
                                fromMe: true,
                            }).catch(err => inputSanitization.handleError(err, client, XA));
                        });
                } catch (err) {
                    throw err;
                }
            };

            if (XA.isReplySticker && !XA.isReplyAnimatedSticker) {
                var replyChatObject = {
                    message:
                        chat.message.extendedTextMessage.contextInfo
                            .quotedMessage.stickerMessage,
                    type: 'sticker'
                };
                var stickerId =
                    chat.message.extendedTextMessage.contextInfo.stanzaId;
                convertToImage(stickerId, replyChatObject);
            } else if (XA.isReplyAnimatedSticker) {
                client.sendMessage(
                    XA.chatId,
                    STOI.TAG_A_VALID_STICKER_MESSAGE,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            } else {
                client.sendMessage(
                    XA.chatId,
                    STOI.TAG_A_VALID_STICKER_MESSAGE,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
            }
            return;
        } catch (err) {
            await inputSanitization.handleError(
                err,
                client,
                XA,
                STOI.ERROR
            );
        }
    },
};
