const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR DITERIMA', qr);
});

client.on('ready', () => {
    console.log('Klien siap!');
});

function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

client.on('message', async msg => {
    const senderContact = await msg.getContact();
    const senderName = senderContact.pushname || senderContact.verifiedName || senderContact.number;
    const messageText = msg.body;

    if (messageText === 'p') {
        try {
            await msg.reply('السلام عليكم');
            await msg.react('✅');
        } catch (error) {
            await msg.react('❌');
        }
    } else if (messageText.startsWith('.create')) {
        try {
            const randomString = generateRandomString(10);
            const email = `${randomString}@aginvpn.me`;
            await msg.reply(`Email sementara dibuat:\n\n ${email}`);
            await msg.react('✅');
        } catch (error) {
            await msg.react('❌');
        }
    } else if (messageText.startsWith('.inbox')) {
        const parts = messageText.split(' ');
        const email = parts[1];
        if (email) {
            try {
                const inbox = await getEmailInbox(email);
                if (inbox.length > 0) {
                    const formattedInbox = inbox.map(item => {
                        return (
                            `📧 *Kotak Masuk Email* 📧\n\n` +
                            `*Dari:* ${item.sender}\n` +
                            `*Subjek:* ${item.subject}\n` +
                            `*Pesan:* ${item.message}\n` +
                            `*Tanggal:* ${new Date(parseInt(item.timestamp)).toLocaleString()}\n` +
                            `--------------------------------\n`
                        );
                    }).join('\n');
                    await msg.reply(`Kotak masuk email untuk ${email}:\n\n${formattedInbox}`);
                    await msg.react('✅');
                } else {
                    await msg.reply(`Tidak ada email ditemukan untuk ${email}.`);
                    await msg.react('✅');
                }
            } catch (error) {
                await msg.react('❌');
            }
        } else {
            await msg.reply('Silakan berikan alamat email yang valid.');
            await msg.react('❌');
        }
    } else if (messageText === '.menu' || messageText.includes('agin')) {
        try {
            const menu = `
┌───🚀
│ Hi @${senderName}👋
└┬|  𝘼𝘿𝘼 𝙔𝘼𝙉𝙂 𝘽𝙄𝙎𝘼 𝙎𝘼𝙔𝘼 𝘽𝘼𝙉𝙏𝙐
┌└─────────────┈
││⿻ .create - Buat email sementara
││⿻ .inbox <email> - Cek kotak masuk email
└─────────────────┈
 │ 𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝘽𝙮 : @Aagin
 └─────────────────┈
            `;
            const imagePath = path.resolve(__dirname, 'menu.jpg');
            const media = MessageMedia.fromFilePath(imagePath);
            await client.sendMessage(msg.from, media, { caption: menu });
            await msg.react('✅');
        } catch (error) {
            await msg.react('❌');
        }
    }
});

client.initialize();

function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Otorisasi aplikasi ini dengan mengunjungi url ini:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Masukkan kode dari halaman tersebut di sini: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Kesalahan saat mengambil token akses', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token disimpan ke', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

async function getEmailInbox(email) {
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    return new Promise((resolve, reject) => {
        authorize(credentials, async (auth) => {
            const gmail = google.gmail({ version: 'v1', auth });
            const res = await gmail.users.messages.list({
                userId: 'me',
                q: `to:${email} in:spam` // Menambahkan pencarian di folder spam
            });
            const messages = res.data.messages || [];
            const inbox = [];
            for (const message of messages) {
                const msg = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id
                });
                const messageData = msg.data.payload.parts.find(part => part.mimeType === 'text/plain');
                const messageBody = messageData ? Buffer.from(messageData.body.data, 'base64').toString() : 'No content';
                inbox.push({
                    id: msg.data.id,
                    sender: msg.data.payload.headers.find(header => header.name === 'From').value,
                    subject: msg.data.payload.headers.find(header => header.name === 'Subject').value,
                    timestamp: msg.data.internalDate,
                    message: messageBody
                });
            }
            resolve(inbox);
        });
    });
}