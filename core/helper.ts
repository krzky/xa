import fs from 'fs'
import config from '../config'
import chalk from 'chalk'
import XAClass from '../sidekick/sidekick'
import { Contact, GroupMetadata, GroupParticipant, proto, WASocket } from '@adiwajshing/baileys'


const resolve = async function (messageInstance: proto.IWebMessageInfo, client: WASocket) {
    var XA: XAClass = new XAClass();
    var prefix: string = config.PREFIX + '\\w+'
    var prefixRegex: RegExp = new RegExp(prefix, 'g');
    var SUDOstring: string = config.SUDO;
    try {
        var jsonMessage: string = JSON.stringify(messageInstance);
    } catch (err) {
        console.log(chalk.redBright("[ERROR] Something went wrong. ", err))
    }
    XA.chatId = messageInstance.key.remoteJid;
    XA.fromMe = messageInstance.key.fromMe;
    XA.owner = client.user.id.replace(/:.*@/g, '@');
    XA.mimeType = messageInstance.message ? (Object.keys(messageInstance.message)[0] === 'senderKeyDistributionMessage' ? Object.keys(messageInstance.message)[2] : Object.keys(messageInstance.message)[0]) : null;
    XA.type = XA.mimeType === 'imageMessage' ? 'image' : (XA.mimeType === 'videoMessage') ? 'video' : (XA.mimeType === 'conversation' || XA.mimeType == 'extendedTextMessage') ? 'text' : (XA.mimeType === 'audioMessage') ? 'audio' : (XA.mimeType === 'stickerMessage') ? 'sticker' : (XA.mimeType === 'senderKeyDistributionMessage' && messageInstance.message?.senderKeyDistributionMessage?.groupId === 'status@broadcast') ? 'status' : null;
    XA.isTextReply = (XA.mimeType === 'extendedTextMessage' && messageInstance.message?.extendedTextMessage?.contextInfo?.stanzaId) ? true : false;
    XA.replyMessageId = messageInstance.message?.extendedTextMessage?.contextInfo?.stanzaId;
    XA.replyParticipant = messageInstance.message?.extendedTextMessage?.contextInfo?.participant.replace(/:.*@/g, '@');;
    XA.replyMessage = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
    XA.body = XA.mimeType === 'conversation' ? messageInstance.message?.conversation : (XA.mimeType == 'imageMessage') ? messageInstance.message?.imageMessage.caption : (XA.mimeType == 'videoMessage') ? messageInstance.message?.videoMessage.caption : (XA.mimeType == 'extendedTextMessage') ? messageInstance.message?.extendedTextMessage?.text : (XA.mimeType == 'buttonsResponseMessage') ? messageInstance.message?.buttonsResponseMessage.selectedDisplayText : null;
    XA.isCmd = prefixRegex.test(XA.body);
    XA.commandName = XA.isCmd ? XA.body.slice(1).trim().split(/ +/).shift().toLowerCase() : null;
    XA.isImage = XA.type === "image";
    XA.isReplyImage = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ? true : false;
    XA.imageCaption = XA.isImage ? messageInstance.message?.imageMessage.caption : null;
    XA.isGIF = (XA.type === 'video' && messageInstance.message?.videoMessage?.gifPlayback);
    XA.isReplyGIF = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.gifPlayback ? true : false;
    XA.isSticker = XA.type === 'sticker';
    XA.isReplySticker = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage ? true : false;
    XA.isReplyAnimatedSticker = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage?.isAnimated;
    XA.isVideo = (XA.type === 'video' && !messageInstance.message?.videoMessage?.gifPlayback);
    XA.isReplyVideo = XA.isTextReply ? (jsonMessage.indexOf("videoMessage") !== -1 && !messageInstance.message?.extendedTextMessage?.contextInfo.quotedMessage.videoMessage.gifPlayback) : false;
    XA.isAudio = XA.type === 'audio';
    XA.isReplyAudio = messageInstance.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ? true : false;
    XA.logGroup = client.user.id.replace(/:.*@/g, '@');;
    XA.isGroup = XA.chatId.endsWith('@g.us');
    XA.isPm = !XA.isGroup;
    XA.sender = (XA.isGroup && messageInstance.message && XA.fromMe) ? XA.owner : (XA.isGroup && messageInstance.message) ? messageInstance.key.participant.replace(/:.*@/g, '@') : (!XA.isGroup) ? XA.chatId : null;
    XA.isSenderSUDO = SUDOstring.includes(XA.sender?.substring(0, XA.sender.indexOf("@")));

    return XA;
}

export = resolve;