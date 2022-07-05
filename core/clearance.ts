import chalk from 'chalk';
import config from '../config';
import { adminCommands, sudoCommands } from "../sidekick/input-sanitization"
import STRINGS from "../lib/db";
import Users from '../database/user';
import format from 'string-format';
import XA from '../sidekick/sidekick';
import { WASocket } from '@adiwajshing/baileys';
import Client from '../sidekick/client';
import { MessageType } from '../sidekick/message-type';

const GENERAL = STRINGS.general;

const clearance = async (XA: XA, client: Client, isBlacklist: boolean): Promise<boolean> => {
    if (isBlacklist) {
        if (XA.isGroup) {
            await client.getGroupMetaData(XA.chatId, XA);
            if ((!XA.fromMe && !XA.isSenderSUDO && !XA.isSenderGroupAdmin)) {
                return false;
            }
        } else if ((!XA.fromMe && !XA.isSenderSUDO)) {
            console.log(chalk.blueBright.bold(`[INFO] Obrolan atau Pengguna Daftar Hitam.`));
            return false;
        }
    }
    else if ((XA.chatId === "917838204238-1634977991@g.us" || XA.chatId === "120363020858647962@g.us" || XA.chatId === "120363023294554225@g.us")) {
        console.log(chalk.blueBright.bold(`[INFO] Bot dinonaktifkan di Grup Dukungan.`));
        return false;
    }
    if (XA.isCmd && (!XA.fromMe && !XA.isSenderSUDO)) {
        if (config.WORK_TYPE.toLowerCase() === "public") {
            if (XA.isGroup) {
                await client.getGroupMetaData(XA.chatId, XA);
                if (adminCommands.indexOf(XA.commandName) >= 0 && !XA.isSenderGroupAdmin) {
                    console.log(
                        chalk.redBright.bold(`[INFO] admin commmand `),
                        chalk.greenBright.bold(`${XA.commandName}`),
                        chalk.redBright.bold(
                            `not executed in public Work Type.`
                        )
                    );
                    await client.sendMessage(
                        XA.chatId,
                        GENERAL.ADMIN_PERMISSION,
                        MessageType.text
                    );
                    return false;
                } else if (sudoCommands.indexOf(XA.commandName) >= 0 && !XA.isSenderSUDO) {
                    console.log(
                        chalk.redBright.bold(`[INFO] sudo commmand `),
                        chalk.greenBright.bold(`${XA.commandName}`),
                        chalk.redBright.bold(
                            `not executed in public Work Type.`
                        )
                    );
                    let messageSent: boolean = await Users.getUser(XA.chatId);
                    if (messageSent) {
                        console.log(chalk.blueBright.bold("[INFO] Pesan promo sudah terkirim ke " + XA.chatId))
                        return false;
                    }
                    else {
                        await client.sendMessage(
                            XA.chatId,
                            format(GENERAL.SUDO_PERMISSION, { worktype: "public", groupName: XA.groupName ? XA.groupName : "private chat", commandName: XA.commandName }),
                            MessageType.text
                        );
                        await Users.addUser(XA.chatId);
                        return false;
                    }
                } else {
                    return true;
                }
            }else if(XA.isPm){
                return true;
            }
        } else if (config.WORK_TYPE.toLowerCase() != "public" && !XA.isSenderSUDO) {
            console.log(
                chalk.redBright.bold(`[INFO] commmand `),
                chalk.greenBright.bold(`${XA.commandName}`),
                chalk.redBright.bold(
                    `not executed in private Work Type.`
                )
            );
            //             let messageSent = await Users.getUser(XA.chatId);
            //             if(messageSent){
            //                 console.log(chalk.blueBright.bold("[INFO] Promo message had already been sent to " + XA.chatId))
            //                 return false;
            //             }
            //             else{
            //                 await client.sendMessage(
            //                     XA.chatId,
            //                     GENERAL.SUDO_PERMISSION.format({ worktype: "private", groupName: XA.groupName ? XA.groupName : "private chat", commandName: XA.commandName }),
            //                     MessageType.text,
            //                     {
            //                         contextInfo: {
            //                             stanzaId: XA.chatId,
            //                             participant: XA.sender,
            //                             quotedMessage: {
            //                                 conversation: XA.body,
            //                             },
            //                         },
            //                     }
            //                 );
            //                 await Users.addUser(XA.chatId)
            //                 return false;
            //             }
        }
    } else {
        return true;
    }
}

export = clearance;
