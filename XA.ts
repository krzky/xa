import { Boom } from '@hapi/boom'
import P, { Logger } from 'pino'
import makeWASocket, { MessageRetryMap, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, WASocket, proto } from '@adiwajshing/baileys'
// @ts-ignore
import useRemoteFileAuthState from './core/dbAuth.js'
import fs from 'fs'
import { join } from 'path'
import config from './config'
import { banner } from './lib/banner'
import chalk from 'chalk'
import Greetings from './database/greeting'
import STRINGS from "./lib/db"
import Blacklist from './database/blacklist'
import clearance from './core/clearance'
import { start } from 'repl'
import format from 'string-format';
import resolve from './core/helper'
import { Sequelize } from 'sequelize/types'
import Command from './sidekick/command'
import XA from './sidekick/sidekick'
import Client from './sidekick/client'
import { MessageType } from './sidekick/message-type'

const sequelize: Sequelize = config.DATABASE;
const GENERAL: any = STRINGS.general;
const msgRetryCounterMap: MessageRetryMap = { };
const logger: Logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({})
logger.level = 'error'

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({ logger })
store?.readFromFile('./session.data.json')
// save every 10s
setInterval(() => {
    store?.writeToFile('./session.data.json')
}, 10_000);

(async () : Promise<void> => {
    console.log(banner);

    let commandHandler: Map<string, Command> = new Map();

    console.log(chalk.yellowBright.bold("[INFO] Memasang Plugin... Harap tunggu >_<"));
    let moduleFiles: string[] = fs.readdirSync(join(__dirname, 'modules')).filter((file) => file.endsWith('.js'))
    for (let file of moduleFiles) {
        try {
            const command: Command = require(join(__dirname, 'modules', `${file}`));
            console.log(
                chalk.magentaBright("[INFO] Modul berhasil diimpor"),
                chalk.cyanBright.bold(`${file}`)
            )
            commandHandler.set(command.name, command);
        } catch (error) {
            console.log(
                chalk.blueBright.bold("[INFO] Tidak dapat mengimpor modul"),
                chalk.redBright.bold(`${file}`)
            )
            console.log(`[ERROR] `, error);
            continue;
        }
    }
    console.log(chalk.green.bold("[INFO] Plugin Berhasil Diinstal. Bot siap digunakan."));
    console.log(chalk.yellowBright.bold("[INFO] Menghubungkan ke Database."));
    try {
        await sequelize.authenticate();
        console.log(chalk.greenBright.bold('[INFO] Koneksi telah berhasil dibuat .'));
    } catch (error) {
        console.error('[ERROR] Tidak dapat terhubung ke database:', error);
    }
    console.log(chalk.yellowBright.bold("[INFO] Sinkronisasi Database..."));
    await sequelize.sync();
    console.log(chalk.greenBright.bold("[INFO] Semua modul berhasil disinkronkan."));

    let firstInit: boolean = true;

    const startSock = async () => {
        // @ts-ignore
        const { state, saveCreds } = await useRemoteFileAuthState();
        const { version, isLatest } = await fetchLatestBaileysVersion()
        const sock: WASocket = makeWASocket({
            version,
            logger,
            printQRInTerminal: true,
            auth: state,
            browser: ["XA", "Chrome", "4.0.0"],
            msgRetryCounterMap,
            // implement to handle retries
            getMessage: async key => {
                return {
                    conversation: '-pls ignore-'
                }
            }
        });

        store?.bind(sock.ev);

        sock.ev.on('messages.upsert', async m => {
            // console.log(JSON.stringify(m, undefined, 2))
            // if(m.type === 'append' && !config.OFFLINE_RESPONSE){
            //     return;
            // }
            if(m.type !== 'notify'){
                // console.log(chalk.redBright(JSON.stringify(m, undefined, 2)));
                return;
            }
            
            let chat: proto.IWebMessageInfo = m.messages[0];
            let XA: XA = await resolve(chat, sock);
            // console.log(XA);
            let client : Client = new Client(sock);
            if(XA.isCmd){
                let isBlacklist: boolean = await Blacklist.getBlacklistUser(XA.sender, XA.chatId);
                const cleared: boolean = await clearance(XA, client, isBlacklist);
                if (!cleared) {
                    return;
                }
                console.log(chalk.redBright.bold(`[INFO] ${XA.commandName} command executed.`));
                const command = commandHandler.get(XA.commandName);
                var args = XA.body.trim().split(/\s+/).slice(1);
                if (!command) {
                    client.sendMessage(XA.chatId, "```Ups, perintah tidak valid! Gunakan```  *.help*  ```to display the command list.```", MessageType.text);
                    return;
                } else if (command && XA.commandName == "help") {
                    try {
                        command.handle(client, chat, XA, args, commandHandler);
                        return;
                    } catch (err) {
                        console.log(chalk.red("[ERROR] ", err));
                        return;
                    }
                }
                try {
                    await command.handle(client, chat, XA, args).catch(err => console.log("[ERROR] " + err));
                } catch (err) {
                    console.log(chalk.red("[ERROR] ", err));
                }
            }
        })

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update
            if (connection === 'close') {
                // reconnect if not logged out
                if ((lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                    startSock()
                } else {
                    console.log(chalk.redBright('Koneksi ditutup. Anda logout. Hapus file XA.db dan session.data.json untuk memindai ulang kode.'));
                    process.exit(0);
                }
            } else if (connection === 'connecting') {
                console.log(chalk.yellowBright("[INFO] Menghubungkan ke WhatsApp..."));
            } else if (connection === 'open') {
                console.log(chalk.greenBright.bold("[INFO] Connected! Welcome to Xa-Userbot"));
                // if (firstInit) {
                //     firstInit = false;
                //     sock.sendMessage(
                //         sock.user.id,
                //         {
                //             text: format(GENERAL.SUCCESSFUL_CONNECTION, {
                //                 worktype: config.WORK_TYPE,
                //             })
                //         }
                //     );
                // }
            } else {
                console.log('connection update', update);
            }
        })

        sock.ev.on('creds.update', saveCreds);

        return sock;
    }

    startSock();
})().catch(err => console.log('[MAINERROR] : %s', chalk.redBright.bold(err)));;
