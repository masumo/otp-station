/**
 * This is the API-handler of your app that contains all your API routes.
 * On a bigger app, you will probably want to split this file up into multiple files.
 */
import * as trpcNext from '@trpc/server/adapters/next';
import { publicProcedure, mergeRouters, router } from '../../../server/trpc';
import { z } from 'zod';
import * as mailParser from 'mailparser';
import * as dotenv from 'dotenv';
import MyImap from '../../../utils/my-imap';
import { serverRouter } from '../../../server/serverRouter';
import { trpc } from '@/utils/trpc';

const pino = require('pino')
const pretty = require('pino-pretty')
const stream = pretty({
  colorize: true
})
const logger = pino({ level: 'info' }, stream)

dotenv.config();

let OTPcodes: (string | null)[] = [];
let otp: string | null = null;

async function run(username:any) {
  const user = trpc.findFirst.useQuery({account:username});
  if(user?.data?.account) console.log("USERNAME "+user.toString());
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
        //let otp = null;
        mailParser.simpleParser(email.body, async (err, parsed) => {          
          otp = matchOTP(parsed.text);
          //otp = matchOTP(email.body);
          console.log("OTP "+ otp);
          OTPcodes.push(otp);
          OTPcodes = OTPcodes;
          console.log(err);
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
    return OTPcodes;
}

function matchOTP(email: any){
  const regex = /\b(?![A-Z]{5}\b)[A-Z0-9]{5}\b/;
  const match = email.match(regex);
  return match && match[0];
}

/*async function parseEmails(){
  run().then(() => {
      //process.exit();
    }).catch((error) => {
        logger.error(error);
        process.exit(1);
    });
}*/

function getOTPcodes(){
  console.log("Array of OTP "+JSON.stringify(OTPcodes));
  return otp;
}

const otpRouter = router({
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
   getOTP: publicProcedure
      .input(
        z.object({
          username: z.string().nullish(),
        }),
      )
      .query(async ({ input }) => {
          let output = null;
          OTPcodes = [];
          console.log("Input "+input?.username);
          let customerUsername = input?.username;
          //const user = trpc.findFirst.useQuery({account:customerUsername??""});
          //console.log("USER "+user.toString());
            try{
              output = await run(customerUsername)
            }
            catch(err){
              logger.error(err);
              process.exit(1);
            }
            //let output = getOTPcodes();
            return output;
      }),
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
const appRouter = mergeRouters(otpRouter, serverRouter);
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});

