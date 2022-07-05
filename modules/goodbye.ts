import Strings from "../lib/db";
import inputSanitization from "../sidekick/input-sanitization";
import Greetings from "../database/greeting";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const GOODBYE = Strings.goodbye;

module.exports = {
    name: "goodbye",
    description: GOODBYE.DESCRIPTION,
    extendedDescription: GOODBYE.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [".goodbye", ".goodbye off", ".goodbye delete"],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            if (!XA.isGroup) {
                client.sendMessage(
                    XA.chatId,
                    GOODBYE.NOT_A_GROUP,
                    MessageType.text
                );
                return;
            }
            if (args.length == 0) {
                await client.getGroupMetaData(XA.chatId, XA);
                var Msg: any = await Greetings.getMessage(XA.chatId, "goodbye");
                try {
                    var enabled = await Greetings.checkSettings(
                        XA.chatId,
                        "goodbye"
                    );
                    if (enabled === false || enabled === undefined) {
                        client.sendMessage(
                            XA.chatId,
                            GOODBYE.SET_GOODBYE_FIRST,
                            MessageType.text
                        );
                        return;
                    } else if (enabled === "OFF") {
                        await client.sendMessage(
                            XA.chatId,
                            GOODBYE.CURRENTLY_DISABLED,
                            MessageType.text
                        );
                        await client.sendMessage(
                            XA.chatId,
                            Msg.message,
                            MessageType.text
                        );
                        return;
                    }

                    await client.sendMessage(
                        XA.chatId,
                        GOODBYE.CURRENTLY_ENABLED,
                        MessageType.text
                    );
                    await client.sendMessage(
                        XA.chatId,
                        Msg.message,
                        MessageType.text
                    );
                } catch (err) {
                    throw err;
                }
            } else {
                try {
                    if (
                        args[0] === "OFF" ||
                        args[0] === "off" ||
                        args[0] === "Off"
                    ) {
                        let switched = "OFF";
                        await Greetings.changeSettings(
                            XA.chatId,
                            switched
                        );
                        client.sendMessage(
                            XA.chatId,
                            GOODBYE.GREETINGS_UNENABLED,
                            MessageType.text
                        );
                        return;
                    }
                    if (
                        args[0] === "ON" ||
                        args[0] === "on" ||
                        args[0] === "On"
                    ) {
                        let switched = "ON";
                        await Greetings.changeSettings(
                            XA.chatId,
                            switched
                        );
                        client.sendMessage(
                            XA.chatId,
                            GOODBYE.GREETINGS_ENABLED,
                            MessageType.text
                        );
                        return;
                    }
                    if (args[0] === "delete") {
                        var Msg: any = await Greetings.deleteMessage(
                            XA.chatId,
                            "goodbye"
                        );
                        if (Msg === false || Msg === undefined) {
                            client.sendMessage(
                                XA.chatId,
                                GOODBYE.SET_GOODBYE_FIRST,
                                MessageType.text
                            );
                            return;
                        }
                        await client.sendMessage(
                            XA.chatId,
                            GOODBYE.GOODBYE_DELETED,
                            MessageType.text
                        );

                        return;
                    }
                    let text = XA.body.replace(
                        XA.body[0] + XA.commandName + " ",
                        ""
                    );

                    var Msg: any = await Greetings.getMessage(
                        XA.chatId,
                        "goodbye"
                    );
                    if (Msg === false || Msg === undefined) {
                        await Greetings.setGoodbye(XA.chatId, text);
                        await client.sendMessage(
                            XA.chatId,
                            GOODBYE.GOODBYE_UPDATED,
                            MessageType.text
                        );

                        return;
                    } else {
                        await Greetings.deleteMessage(
                            XA.chatId,
                            "goodbye"
                        );
                        await Greetings.setGoodbye(XA.chatId, text);
                        await client.sendMessage(
                            XA.chatId,
                            GOODBYE.GOODBYE_UPDATED,
                            MessageType.text
                        );
                        return;
                    }
                } catch (err) {
                    throw err;
                }
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, XA);
        }
    },
};
