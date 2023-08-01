/**
 * This is a Next.js page.
 */
"use client";
import * as React from 'react';
import { trpc } from '../utils/trpc';
import { Button, Input, Typography, Spinner, Alert } from "@material-tailwind/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export default function IndexPage() {
  const [customer, setCustomer] = React.useState<string>("");
  const {isFetching, error, data, refetch } = trpc.getOTP.useQuery(
          { username: customer }, 
          {
            refetchOnWindowFocus: false, enabled: false, refetchOnMount:false, cacheTime:0,
          });
          console.log("DATA "+JSON.stringify(data));
  // 💡 Tip: CMD+Click (or CTRL+Click) on `greeting` to go to the server definition
  //const result = trpc.greeting.useQuery({ name: 'you....' });
  //const result = trpc.findAll.useQuery();
  //console.log("FIND ALL"+ JSON.stringify(result.data));
  return (
          <div className="h-screen flex flex-col justify-center items-center ">
          {/**
           * The type is defined and can be autocompleted
           * 💡 Tip: Hover over `data` to see the result type
           * 💡 Tip: CMD+Click (or CTRL+Click) on `text` to go to the server definition
           * 💡 Tip: Secondary click on `text` and "Rename Symbol" to rename it both on the client & server
           */}
          <div className="w-72 mb-6">
              <Input 
                label="shopee-username" 
                name="customer"
                value={customer}
                onInput={e => setCustomer(e.currentTarget.value)} />
          </div>
          
          <Button className="mb-4" onClick={ ()=>refetch()}>
            Tampilkan kode OTP
          </Button>
          { 
            !isFetching && data? // TODO: anciticapte when there is error and the data is not null (there is data in cache) example: suppose there is an email OTP code arrives. we request the OTP. the OTP showed. and then we directly request the OTP again. there should be NOT FOUND ERROR, but the OTP is still available in the data (cache)
                <Alert
                color="green"
                className="max-w-screen-sm"
                icon={<CheckCircleIcon className="mt-px h-6 w-6" />}
                >
                <Typography variant="h5" color="white">
                  Sukses
                </Typography>
                <Typography color="white" className="mt-2 font-normal">
                  Kode OTP: {data} 
                </Typography>
              </Alert>
              : <p></p>
          }
          { 
          isFetching? 
                <>
                    <Typography variant="medium" color="blue-gray" className="text-center mb-4 font-medium">Mengecek kode OTP...</Typography>
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
                  {error.message}
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