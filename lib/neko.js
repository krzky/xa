// Disabled till fix can be found.

// const { MessageType } = require("@adiwajshing/baileys");
// const inputSanitization = require("../sidekick/input-sanitization");
// const String = require("../lib/db.js");
// const got = require("got");
// const REPLY = String.neko;
// module.exports = {
//     name: "neko",
//     description: REPLY.DESCRIPTION,
//     extendedDescription: REPLY.EXTENDED_DESCRIPTION,
//     demo: {
//         isEnabled: true,
//         text: '.neko #include <iostream> \nint main() \n{\n   std::cout << "Hello XA!"; \n   return 0;\n}',
//     },
//     async handle(client, chat, XA, args) {
//         try {
//             if (args.length === 0 && !XA.isReply) {
//                 await client.sendMessage(
//                     XA.chatId,
//                     REPLY.ENTER_TEXT,
//                     MessageType.text
//                 ).catch(err => inputSanitization.handleError(err, client, XA));
//                 return;
//             }
//             const processing = await client.sendMessage(
//                 XA.chatId,
//                 REPLY.PROCESSING,
//                 MessageType.text
//             ).catch(err => inputSanitization.handleError(err, client, XA));
//             if (!XA.isReply) {
//                 var json = {
//                     content: XA.body.replace(
//                         XA.body[0] + XA.commandName + " ",
//                         ""
//                     ),
//                 };
//             } else {
//                 var json = {
//                     content: XA.replyMessage.replace(
//                         XA.body[0] + XA.commandName + " ",
//                         ""
//                     ),
//                 };
//             }
//             let text = await got.post("https://nekobin.com/api/documents", {
//                 json,
//             });
//             json = JSON.parse(text.body);
//             neko_url = "https://nekobin.com/" + json.result.key;
//             client.sendMessage(XA.chatId, neko_url, MessageType.text).catch(err => inputSanitization.handleError(err, client, XA));
//             return await client.deleteMessage(XA.chatId, {
//                 id: processing.key.id,
//                 remoteJid: XA.chatId,
//                 fromMe: true,
//             }).catch(err => inputSanitization.handleError(err, client, XA));
//         } catch (err) {
//             if (json.result == undefined) {
//                 await inputSanitization.handleError(
//                     err,
//                     client,
//                     XA,
//                     REPLY.TRY_LATER
//                 );
//             } else {
//                 await inputSanitization.handleError(err, client, XA);
//             }
//             return await client.deleteMessage(XA.chatId, {
//                 id: processing.key.id,
//                 remoteJid: XA.chatId,
//                 fromMe: true,
//             }).catch(err => inputSanitization.handleError(err, client, XA));
//         }
//     },
// };
