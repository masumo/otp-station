/**
 * This is the API-handler of your app that contains all your API routes.
 * On a bigger app, you will probably want to split this file up into multiple files.
 */
import * as trpcNext from '@trpc/server/adapters/next';
import { publicProcedure, router } from '../../../server/trpc';
import { z } from 'zod';
import Imap from 'imap';
import * as mailParser from 'mailparser';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import MyImap from '../../../utils/my-imap';
import { parse } from 'path';
const logger = require('pino')({
  transport: {
      target: 'pino-pretty',
      options: {
          translateTime: false,
          colorize: true,
          ignore: 'pid,hostname,time',
      },
  },
});
dotenv.config();

let OTPcodes: (string | null)[] = [];

async function run() {
    const config = {
        imap: {
            user: process.env.NEXT_PUBLIC_YMAIL_USER,
            password: process.env.NEXT_PUBLIC_YMAIL_PASSWORD,
            host: process.env.NEXT_PUBLIC_YMAIL_HOST,
            port: process.env.NEXT_PUBLIC_EMAIL_PORT,
            tls: process.env.NEXT_PUBLIC_EMAIL_TLS,
        },
        debug: logger.info.bind(logger),
    };

    const imap = new MyImap(config);
    const result = await imap.connect();
    logger.info(`result: ${result}`);
    const boxName = await imap.openBox();
    logger.info(`boxName: ${boxName}`);

    const criteria = [];
    //criteria.push('UNSEEN');
    //criteria.push(['SINCE', moment().format('MMMM DD, YYYY')]);
    criteria.push(['HEADER', 'SUBJECT', 'Steam Account']);
    
    const emails = await imap.fetchEmails(criteria);
    for (let email of emails){
        let otp = null;
        mailParser.simpleParser(email.body, async (err, parsed) => {
          //const {from, subject, textAsHtml, text} = parsed;
          //console.log("EMAIL judul "+parsed);
          
          otp = matchOTP(parsed.text);
          console.log("OTP "+ otp);
          OTPcodes.push(otp);

          //console.log(JSON.stringify(parsed));
          /* Make API call to save the data
            Save the retrieved data into a database.
            E.t.c
          */
        //console.log(err);
        });
    }

    //logger.info(emails);

    /*
    for (const email of emails) {
        for (const file of email.files) {
            const lines = Buffer.from(file.buffer).toString().split('\n');
            logger.info(lines, `filename: ${file.originalname}`);
        }
        logger.info(email.body.split('\n'), 'body:');
    }
    */
    await imap.end();
}

function matchOTP(email: any){
  const regex = /\b(?![A-Z]{5}\b)[A-Z0-9]{5}\b/;
  const match = email.match(regex);
  return match && match[0];
}

function parseOTP(email: any) {
  let otpKeyPhrase = "Steam login credentials:";
  let otpKeyPhrase_B = "Guard code you need to access your account:";
  const otpLength = 5; //panjang "FC6JB"
  //console.log(parsedText);
  let pos = email.body.indexOf(otpKeyPhrase);
  if(pos!=-1){ //jika otpKeyPhrase ditemukan
    pos = pos + otpKeyPhrase.length + 6; // 6 adalah jumlah spaces (termasuk newline) antara otpKeyPhrase dengan kode_OTP   
  }else if(pos==-1){ //jika otpKeyPhrase tidak ditemukan, cari otpKeyPhrase_B
    pos = email.body.indexOf(otpKeyPhrase_B);
    pos = pos + otpKeyPhrase_B.length + 6;
  }
  //console.log("POSITION "+pos);
  let otp = email.body.substring(pos, pos + otpLength);
  return otp;
}

async function parseEmails(){
    await run().then(() => {
      //process.exit();
    }).catch((error) => {
        logger.error(error);
        process.exit(1);
    });
}

function getOTPcodes(){
  console.log("Array of OTP "+JSON.stringify(OTPcodes));
  return OTPcodes;
}

const appRouter = router({
  greeting: publicProcedure
    // This is the input schema of your procedure
    // 💡 Tip: Try changing this and see type errors on the client straight away
    .input(
      z.object({
        name: z.string().nullish(),
      }),
    )
    .query(({ input }) => {
      // This is what you're returning to your client
      return {
        text: `hello ${input?.name ?? 'world'}`,
        // 💡 Tip: Try adding a new property here and see it propagate to the client straight-away
      };
    }),
  // 💡 Tip: Try adding a new procedure here and see if you can use it in the client!
   getOTP: publicProcedure.query(async () => {
    /*let output = parseEmails().then(() => {
      getOTPcodes();
    });
    */
    await parseEmails();
    let output = getOTPcodes();
    return output;
  }),
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});

