import player1 from 'play-sound'
import open from'open'
import fetch from 'node-fetch'
import logUpdate from 'log-update';
import twilio from 'twilio';

const player = player1()
const urls = ['https://fanatec.com/us-en/racing-wheels-wheel-bases/wheel-bases/csl-dd-5-nm', 'https://fanatec.com/us-en/racing-wheels-wheel-bases/racing-wheels/csl-dd-8-nm', "https://fanatec.com/us-en/racing-wheels-wheel-bases/racing-wheels/csl-dd-racing-wheel-wrc-for-xbox-pc-8-nm"]
const phoneNumbers = ['+13045536067']
const fetchPage = async (url) => {
    return await (await fetch(url, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "x-split-tcv": "193"
        },
        "referrer": "https://fanatec.com/us-en/racing-wheels-wheel-bases/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    })).text();
}

const check = async (url) => {
    const data = await fetchPage(url)
    if (!data.includes('This product is sold out.')){
        console.log(`IN STOCK: ${url}`)
        open(url);
        player.play('alarm.mp3', function(err){
            if (err) throw err
        })
        phoneNumbers.forEach(async number=>{
            inStock(url, number)
            await sleep(10)
        })
        await sleep(5)
        process.exit();
    }
}

const sleep = async (time = 45) => {
    return new Promise(resolve => setTimeout(resolve, time * 1000));
}

const date = new Date();
let attempts = 0;

function printProgress(){
    let timeInMs = new Date() - date;
    let days = Math.floor(timeInMs/1000/60/60/24); 
    if ( days > 0){
        timeInMs = timeInMs - Math.floor(days*1000*60*60*24); 
    }
    let hours = Math.floor(timeInMs/1000/60/60)
    if ( hours > 0){
        timeInMs = timeInMs - Math.floor(hours*1000*60*60); 
    }
    let mins = Math.floor(timeInMs/1000/60);
    if ( mins > 0){
        timeInMs = timeInMs - Math.floor(mins*1000*60); 
    }
    logUpdate(`attempts: ${attempts}\nDays: ${days}\nHours: ${hours}\nmins: ${mins}`);
}

function runUpdates (){
    setTimeout(()=>{
        printProgress()
        runUpdates()
    }, 5000)
}


const run = async () => {
    Promise.all(urls.map(url=>{check(url)}))
    attempts++;
    await sleep()
    return await run();
}

const main = async () => {
    run();
}

const inStock = (url,phone) => {
    // Find your account sid and auth token in your Twilio account Console.
    var client = new twilio('', '');

    // Send the text message.
    client.messages.create({
        to: phone,
        from: '+12025195324',
        body: `FANATECH DD IN STOCK: ${url}`
    });
    console.log(`sent text to ${phone}`)
}


main();
runUpdates()
