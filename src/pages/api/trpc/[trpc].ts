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
dotenv.config();

let OTPcodes: (string | null)[] = [];

async function checkEmails(){
  
  const promises: any[] = [];
  let gmailImap = new Imap({
    user: process.env.NEXT_PUBLIC_GMAIL_USER?? "",
    password: process.env.NEXT_PUBLIC_APP_PASSWORD?? "",
    host: "imap.gmail.com", //this may differ if you are using some other mail services like yahoo
    port: 993,
    tls: true,
    connTimeout: 10000, // Default by node-imap 
    authTimeout: 5000, // Default by node-imap, 
    debug: console.log, // Or your custom function with only one incoming argument. Default: null 
    tlsOptions: { rejectUnauthorized: false }
  });

  function openInbox(cb: { (err: any, box: any): void; (error: Error, mailbox: Imap.Box): void; }) {
    gmailImap.openBox('INBOX', false, cb);
  }

  function getOTP(parsedText: any){
    let otpKeyPhrase = "Steam login credentials:";
    let otpKeyPhrase_B = "Guard code you need to access your account:";
    const otpLength = 5; //panjang "FC6JB"
    //console.log(parsedText);
    let pos = parsedText.indexOf(otpKeyPhrase);
    if(pos!=-1){ //jika otpKeyPhrase ditemukan
      pos = pos + otpKeyPhrase.length + 6; // 6 adalah jumlah spaces (termasuk newline) antara otpKeyPhrase dengan kode_OTP   
    }else if(pos==-1){ //jika otpKeyPhrase tidak ditemukan, cari otpKeyPhrase_B
      pos = parsedText.indexOf(otpKeyPhrase_B);
      pos = pos + otpKeyPhrase_B.length + 6;
    }
    //console.log("POSITION "+pos);
    let otp = parsedText.substring(pos, pos + otpLength);
    return otp;
  }

  gmailImap.once('ready', function () {
    openInbox(function (err: any, _box: any) {
      if (err) throw err;
      gmailImap.search(['SEEN', ['SUBJECT', 'Steam Account']], function (err: any, results: any) {
        if (err) throw err;
        var f = gmailImap.fetch(results, { bodies: '', markSeen: true });
        f.on('message', (msg: { on: (arg0: string, arg1: (stream: any) => void) => void; once: (arg0: string, arg1: { (attrs: any): void; (): void; }) => void; }) => {
          msg.on('body', (stream: any) => {
              
            mailParser.simpleParser(stream, async (_err: any, parsed) => {
              //const {from, subject, textAsHtml, text} = parsed;
              //console.log("EMAIL judul "+parsed);
              let otp: string | null = null;
              otp = getOTP(parsed.text);
              console.log("OTP "+ otp);              
              //OTPcodes.push(otp);
              promises.push(otp);
  
              //console.log(JSON.stringify(parsed));
              /* Make API call to save the data
                 Save the retrieved data into a database.
                 E.t.c
              */
             //console.log(err);
            });
            
          });
         
          msg.once('end', function () {
            //console.log(prefix + 'Finished');
          });
        });
        f.once('error', function (err: string) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function () {
          console.log('Done fetching all messages!');
          gmailImap.end();
        });
      });
    });
  });
  
  
  
  gmailImap.once('error', function (err: any) {
    console.log(err);
  });
  
  gmailImap.once('end', function () {
    console.log('Connection ended');
  });
  
  gmailImap.connect(); 

  
  
  OTPcodes = await Promise.all(promises);
  console.log("ARRAY "+ JSON.stringify(OTPcodes));

  //return OTPcodes;
}

async function getOTPcodes(){
  await checkEmails();
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
   getUser: publicProcedure.query(async () => {
    return await getOTPcodes();
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