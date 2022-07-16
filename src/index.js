import { faker } from '@faker-js/faker';
import domtoimage from 'dom-to-image';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import tmi from 'tmi.js';
import { NFTStorage, Blob } from 'nft.storage';
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min'


const fonts = [
    "Josefin Sans",
    "Oswald",
    "Ubuntu",
    "Rokkitt",
    "Roboto",
    "Latin Modern Mono",
    "Comic Neue",
    "Blogger Sans",
    "Anonymous Pro"
]

let elements = [];
let messageBuffer = [];


const chatAuthToken = localStorage.getItem('chatAuthToken');
const twitchChannel = localStorage.getItem('twitchChannel');
const tatumApiKey = localStorage.getItem('tatumApiKey');
const nftStorageApiKey = localStorage.getItem('nftStorageApiKey');
const debug = localStorage.getItem('debug');
const body = document.querySelector('body');




// create notification
const createNotif = (msg) => {
    console.log(`NOTIF: ${msg}`)
    const bod = document.querySelector('body');
    const textEl = document.createElement('p');
    textEl.className = 'notification';
    textEl.textContent = msg;
    bod.appendChild(textEl);
    elements.push(textEl);
}


// show a notification if a required config value is missing
if (!chatAuthToken) createNotif('chatAuthToken is missing from localStorage, but it is required.');
if (!twitchChannel) createNotif('twitchChannel is missing from localStorage, but it is required.');
if (!tatumApiKey) createNotif('tatumApiKey is missing from localStorage, but it is required.');
if (!nftStorageApiKey) createNotif('nftStorageApiKey is missing from localStorage, but it is required.')
if (debug === null) localStorage.setItem('debug', false);




const client = new tmi.Client({
    options: { 
        debug: true,
        skipUpdatingEmotesets: true,
    },
    identity: {
        username: twitchChannel,
        password: chatAuthToken
    },
    channels: [ twitchChannel ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    // Ignore echoed messages.
    if (self) return;

    if (message.toLowerCase() === '!hello') {
        // "@GunRun, heya!"
        //client.say(channel, `@${tags.username}, heya!`);
        console.log('we WOULD be running client.say(...) here, but for testing we are not.');
    } else {
        messageBuffer.push(message);
    }


});



// get random int
// greets https://stackoverflow.com/a/7228322/1004931
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// function which creates a text element on screen
const createText = (input) => {
    // @todo do i need to sanitize???
    const bod = document.querySelector('body');
    const textEl = document.createElement('span');
    const font = randomFont();
    textEl.style.fontFamily = font;
    textEl.style.fontSize = `${randomIntFromInterval(6, 24)}pt`;
    textEl.textContent = input;
    bod.appendChild(textEl);
    elements.push(textEl);
}

// function which chooses a random font
const randomFont = () => fonts[randomIntFromInterval(0, fonts.length)];


// detect if the page is overflown with text
const isOverflown = (el) => {
   return (el.parentElement.clientHeight < el.scrollHeight);
}

const mintNft = async (ipfsImageUrl) => {

    

    console.log(`  MINT`);
    // client.say(twitchChannel, `NFT Minted! ${url}`);
}


const getScreenshot = async (el) => {

    // save html as image
    const options = { logging: false, useCORS: false, backgroundColor: 'black' };
    const canvas = await html2canvas(document.querySelector("body"), options);

    return canvas;
    // await saveAs(canvas.toDataURL(), `typografNFT_${Date.now()}.png`);

}


const getBlobFromCanvas = async (canvas) => {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        });
    });
}


// use nft.storage to save the image to IPFS
const storeNftImage = async (blob) => {

    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: nftStorageApiKey });
    const cid = await nftstorage.storeBlob(blob);

    console.log(cid)
    return cid;

}


const clearPage = () => {
    for (const el of elements) {
        el.remove();
    }
}



////
// doTheProcess
// if the page is overflowed, mint nft and clear page.
// if the page is not overflowed, check the message buffer for messages.
//   if there is a message, render the first message to the page
//   if there are no messages, do nothing.
const doTheProcess = async () => {
    if (isOverflown(body)) {
        const canvas = await getScreenshot(document.querySelector('body'));
        const imageBlob = await getBlobFromCanvas(canvas);
        console.log(imageBlob);
        const ipfsImageUrl = await storeNftImage(imageBlob);
        const nftUrl = await mintNft(ipfsImageUrl);
        clearPage();
    } else {
        const message = messageBuffer.shift();
        if (message) createText(message);
    }
}


// greets https://stackoverflow.com/a/22707551/1004931
const delay = (time) => new Promise(resolve => setTimeout(resolve, time));


const createSampleMessage = () => {
    if (window.localStorage.getItem('debug') === "true") {
        messageBuffer.push(faker.lorem.sentence(randomIntFromInterval(1, 10)));
    }
}


// run the process in a loop, forever
(async function main () {
    await delay(1500);
    createSampleMessage();
    await doTheProcess();
    await main();
})();

