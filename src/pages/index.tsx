/**
 * This is a Next.js page.
 */
"use client";
import * as React from 'react';
import { trpc } from '../utils/trpc';
import { Button, Typography } from "@material-tailwind/react";

export default function IndexPage() {
  //const [data, setData] = React.useState(null);
  const [isWaiting, setWaiting] = React.useState(false);
  const emulateFetch = _ => {
    return new Promise(resolve => {
      resolve([{ data: "ok" }]);
    });
  };
  const {isLoading, error, data, refetch } = trpc.getOTP.useQuery(
                                                undefined, 
                                                {
                                                  refetchOnWindowFocus: false, enabled: false,
                                                });
  let otp = null;
  const handleClick = (setWaiting:any) => {
    // manually refetch
    setWaiting(true);
    refetch();
    setWaiting(false);
  };

  // 💡 Tip: CMD+Click (or CTRL+Click) on `greeting` to go to the server definition
  //const result = trpc.greeting.useQuery({ name: 'you....' });
  if (isLoading) return (
    <div className="flex flex-col justify-center items-center ">
        <Button className="mt-10 mb-2" onClick={()=>handleClick(setWaiting)}>
          Display OTP
        </Button>
        { 
          isWaiting? <Typography variant="medium" color="blue-gray" className="text-center mb-2 font-medium">Checking OTP...</Typography> : <p></p>
        }
    </div>
    
  )
  return (
          <div className="flex flex-col justify-center items-center ">
          {/**
           * The type is defined and can be autocompleted
           * 💡 Tip: Hover over `data` to see the result type
           * 💡 Tip: CMD+Click (or CTRL+Click) on `text` to go to the server definition
           * 💡 Tip: Secondary click on `text` and "Rename Symbol" to rename it both on the client & server
           */}
          <Button className="mt-10 mb-2" onClick={handleClick}>
            Display OTP
          </Button>
          { 
            data? <Typography variant="medium" color="black" className="text-center mb-2 font-medium">{JSON.stringify(data)}</Typography> : <p></p>
          }
        </div>
  );
}



const styles = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};