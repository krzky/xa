import Greetings from "../database/greeting";
import inputSanitization from "../sidekick/input-sanitization";
import Strings from "../lib/db";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
const WELCOME = Strings.welcome;

module.exports = {
    name: "welcome",
    description: WELCOME.DESCRIPTION,
    extendedDescription: WELCOME.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [".welcome", ".welcome off", ".welcome delete"],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            if (!XA.isGroup) {
                client.sendMessage(
                    XA.chatId,
                    WELCOME.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            }
            await client.getGroupMetaData(XA.chatId, XA);
            var Msg: any = await Greetings.getMessage(XA.chatId, "welcome");
            if (args.length == 0) {
                var enabled = await Greetings.checkSettings(
                    XA.chatId,
                    "welcome"
                );
                try {
                    if (enabled === false || enabled === undefined) {
                        client.sendMessage(
                            XA.chatId,
                            WELCOME.SET_WELCOME_FIRST,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, XA));
                        return;
                    } else if (enabled === "OFF") {
                        await client.sendMessage(
                            XA.chatId,
                            WELCOME.CURRENTLY_DISABLED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, XA));
                        await client.sendMessage(
                            XA.chatId,
                            Msg.message,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, XA));
                        return;
                    }

                    await client.sendMessage(
                        XA.chatId,
                        WELCOME.CURRENTLY_ENABLED,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, XA));
                    await client.sendMessage(
                        XA.chatId,
                        Msg.message,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, XA));
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
                            WELCOME.GREETINGS_UNENABLED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, XA));
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
                            WELCOME.GREETINGS_ENABLED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, XA));

                        return;
                    }
                    if (args[0] === "delete") {
                        var Msg: any = await Greetings.deleteMessage(
                            XA.chatId,
                            "welcome"
                        );
                        if (Msg === false || Msg === undefined) {
                            client.sendMessage(
                                XA.chatId,
                                WELCOME.SET_WELCOME_FIRST,
                                MessageType.text
                            ).catch(err => inputSanitization.handleError(err, client, XA));
                            return;
                        }

                        await client.sendMessage(
                            XA.chatId,
                            WELCOME.WELCOME_DELETED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, XA));

                        return;
                    }
                    let text = XA.body.replace(
                        XA.body[0] + XA.commandName + " ",
                        ""
                    );
                    if (Msg === false || Msg === undefined) {
                        await Greetings.setWelcome(XA.chatId, text);
                        await client.sendMessage(
                            XA.chatId,
                            WELCOME.WELCOME_UPDATED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, XA));

                        return;
                    } else {
                        await Greetings.deleteMessage(
                            XA.chatId,
                            "welcome"
                        );
                        await Greetings.setWelcome(XA.chatId, text);
                        await client.sendMessage(
                            XA.chatId,
                            WELCOME.WELCOME_UPDATED,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, XA));

                        return;
                    }
                } catch (err) {
                    throw err;
                }
            }
        } catch (err) {
            inputSanitization.handleError(err, client, XA);
            return;
        }
    },
};
