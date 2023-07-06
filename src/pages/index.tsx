/**
 * This is a Next.js page.
 */
"use client";
import * as React from 'react';
import { trpc } from '../utils/trpc';
import { Button, Typography, Spinner, Alert } from "@material-tailwind/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export default function IndexPage() {
  
  const {isFetching, error, data, refetch } = trpc.getOTP.useQuery(
                                                undefined, 
                                                {
                                                  refetchOnWindowFocus: false, enabled: false,
                                                });

  // 💡 Tip: CMD+Click (or CTRL+Click) on `greeting` to go to the server definition
  //const result = trpc.greeting.useQuery({ name: 'you....' });
  return (
          <div className="h-screen flex flex-col justify-center items-center ">
          {/**
           * The type is defined and can be autocompleted
           * 💡 Tip: Hover over `data` to see the result type
           * 💡 Tip: CMD+Click (or CTRL+Click) on `text` to go to the server definition
           * 💡 Tip: Secondary click on `text` and "Rename Symbol" to rename it both on the client & server
           */}
          <Button className="mb-4" onClick={ ()=> refetch()}>
            Display OTP
          </Button>
          { 
            !isFetching && data? 
                <Alert
                color="green"
                className="max-w-screen-sm"
                icon={<CheckCircleIcon className="mt-px h-6 w-6" />}
                >
                <Typography variant="h5" color="white">
                  Success
                </Typography>
                <Typography color="white" className="mt-2 font-normal">
                  Your OTP Code: {JSON.stringify(data)}
                </Typography>
              </Alert>
              : <p></p>
          }
          { 
          isFetching? 
                <>
                    <Typography variant="medium" color="blue-gray" className="text-center mb-4 font-medium">Checking OTP...</Typography>
                    <Spinner className="h-10 w-10 text-blue-500/10" />
                </>
              : <p></p>
        }
        { 
            error? 
                <Alert
                color="red"
                className="max-w-screen-sm"
                icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                >
                <Typography variant="h5" color="white">
                  Error
                </Typography>
                <Typography color="white" className="mt-2 font-normal">
                  {error.data} <br/> {error.message}
                </Typography>
              </Alert>
              : <p></p>
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