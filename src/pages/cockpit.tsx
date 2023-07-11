import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import { trpc } from "@/utils/trpc";
import {LoginButton} from "@/components/LoginButton";

import {
  Card,
  CardContent,
  CardForm,
  CardHeader,
  List,
  ListItem,
} from "../components";
import { CustomerList } from "@prisma/client";

const Home: NextPage = () => {
  const [itemName, setItemName] = useState<string>("");

  const { data: list, refetch } = trpc.findAll.useQuery();
  const insertMutation = trpc.insertOne.useMutation( {
    onSuccess: () => refetch(),
  });
  const deleteAllMutation = trpc.deleteAll.useMutation( {
    onSuccess: () => refetch(),
  });
  const updateOneMutation = trpc.updateOne.useMutation( {
    onSuccess: () => refetch(),
  });

  const insertOne = useCallback(() => {
    if (itemName === "") return;

    insertMutation.mutate({
      account: itemName,
    });

    setItemName("");
  }, [itemName, insertMutation]);

  const clearAll = useCallback(() => {
    if (list?.length) {
      deleteAllMutation.mutate({
        ids: list.map((item) => item.id),
      });
    }
  }, [list, deleteAllMutation]);

  const updateOne = useCallback(
    (item: CustomerList) => {
      updateOneMutation.mutate({
        ...item,
        checked: !item.checked,
      });
    },
    [updateOneMutation]
  );

  return (
    <>
      <Head>
        <title>Customer List</title>
        <meta name="description" content="Visit www.mosano.eu" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <LoginButton></LoginButton>
        <Card>
          <CardContent>
            <CardHeader
              title="Customer List"
              listLength={list?.length ?? 0}
              clearAllFn={clearAll}
            />
            <List>
              {list?.map((item) => (
                <ListItem key={item.id} item={item} onUpdate={updateOne} />
              ))}
            </List>
          </CardContent>
          <CardForm
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            submit={insertOne}
          />
        </Card>
      </main>
    </>
  );
};


export default Home;