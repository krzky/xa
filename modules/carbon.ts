import chalk from "chalk";
import String from "../lib/db.js";
import * as Carbon from "unofficial-carbon-now";
import inputSanitization from "../sidekick/input-sanitization";
import format from "string-format";
import Client from "../sidekick/client.js";
import XA from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import { proto } from "@adiwajshing/baileys";

const CARBON = String.carbon;

module.exports = {
    name: "carbon",
    description: CARBON.DESCRIPTION,
    extendedDescription: CARBON.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".carbon helloworld.",
            '.carbon #include <iostream> \nint main() \n{\n   std::cout << "Hello XaUserbot"; \n   return 0;\n} -t yeti',
            ".carbon -t",
        ],
    },
    async handle(client: Client, chat: proto.IWebMessageInfo, XA: XA, args: string[]): Promise<void> {
        try {
            let themes: string[] = [
                "3024 night",
                "a11y dark",
                "blackboard",
                "base 16 (dark)",
                "base 16 (light)",
                "cobalt",
                "duotone",
                "hopscotch",
                "lucario",
                "material",
                "monokai",
                "night owl",
                "nord",
                "oceanic next",
                "one light",
                "one dark",
                "panda",
                "paraiso",
                "seti",
                "shades of purple",
                "solarized (dark)",
                "solarized (light)",
                "synthwave '84",
                "twilight",
                "verminal",
                "vscode",
                "yeti",
                "zenburn",
            ];
            let code: string = "";
            let themeInput: string;
            if (args[0] == null && !XA.isTextReply) {
                await client.sendMessage(
                    XA.chatId,
                    CARBON.NO_INPUT,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            } else if (XA.isTextReply && !XA.replyMessage) {
                await client.sendMessage(
                    XA.chatId,
                    CARBON.INVALID_REPLY,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return;
            } else if (XA.isTextReply) {
                code = XA.replyMessage;
                themeInput = themes[Math.floor(Math.random() * themes.length)];
            } else {
                try {
                    let text: string = XA.body.replace(
                        XA.body[0] + XA.commandName + " ",
                        ""
                    );
                    if (text[0] === "-" && text[1] === "t") {
                        if(text[2] == null){
                            let counter: number = 1;
                            let message: string = 'Available themes: ';
                            themes.forEach((theme) => {
                                message += `\n${counter}. ${theme}`;
                                counter += 1;
                            })
                            await client.sendMessage(
                                XA.chatId,
                                "```" + message + "```",
                                MessageType.text
                            )
                            return;
                        }
                        else{
                            await client.sendMessage(
                                XA.chatId,
                                CARBON.NO_INPUT,
                                MessageType.text
                            ).catch(err => inputSanitization.handleError(err, client, XA));
                            return;
                        }
                    }
                    let body: string[] = XA.body.split("-t");
                    code = body[0].replace(
                        XA.body[0] + XA.commandName + " ",
                        ""
                    );
                    themeInput = body[1].substring(1);
                    if (!themes.includes(themeInput)) {
                        await client.sendMessage(
                            XA.chatId,
                            CARBON.INVALID_THEME,
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, XA));
                        return;
                    }
                } catch (err) {
                    if (err instanceof TypeError) {
                        code = XA.body.replace(
                            XA.body[0] + XA.commandName + " ",
                            ""
                        );
                        themeInput =
                            themes[Math.floor(Math.random() * themes.length)];
                    }
                }
            }
            try {
                const processing: proto.WebMessageInfo = await client.sendMessage(
                    XA.chatId,
                    CARBON.CARBONIZING,
                    MessageType.text
                );
                const carbon = new Carbon.createCarbon()
                    .setCode(code)
                    .setPrettify(true)
                    .setTheme(themeInput);
                const output = await Carbon.generateCarbon(carbon);
                await client.sendMessage(
                    XA.chatId,
                    output,
                    MessageType.image,
                    {
                        caption: format(CARBON.OUTPUT, themeInput),
                    }
                ).catch(err => inputSanitization.handleError(err, client, XA));
                return await client.deleteMessage(XA.chatId, {
                    id: processing.key.id,
                    remoteJid: XA.chatId,
                    fromMe: true,
                });
            } catch (err) {
                throw err;
            }
        } catch (err) {
            await inputSanitization.handleError(err, client, XA);
        }
    },
};
