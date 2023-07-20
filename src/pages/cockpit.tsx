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
  ListItemEditing,
} from "../components";
import { CustomerList } from "@prisma/client";

const Home: NextPage = () => {
  const [itemName, setItemName] = useState<string>("");
  const [accountEdit, setAccountEdit] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

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

  const editTodo = useCallback(
    (item: CustomerList) => {
      updateOneMutation.mutate({
        ...item,
        checked: !item.checked,
      });
    },
    [updateOneMutation]
  );

  function handleEditClick() {
    // set editing to true
    setIsEditing(true);
    // set the currentTodo to the todo item that was clicked
    //setCurrentTodo({ ...todo });
  };

  function handleCancelEdit() {
    // set editing to true
    setIsEditing(false);
  };

  const setCustomerAccount = useCallback(
    (account: string) => {
      setAccountEdit(account)
    },
    [updateOneMutation]
  );
  
  const editCustAccount = useCallback(
    (custId: string) => {
      if (accountEdit === "") return;
      updateOneMutation.mutate({
        account: accountEdit,
        id: custId,
        checked: false,
      });
      setIsEditing(false);
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
                !isEditing?
                <ListItem key={item.id} item={item} onUpdate={updateOne} editTodo={handleEditClick} />
                :
                <ListItemEditing key={item.id} item={item} onUpdate={updateOne} editTodo={handleEditClick} cancelEdit={handleCancelEdit} handleCustomerChange={setCustomerAccount} saveEdit={editCustAccount} />
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