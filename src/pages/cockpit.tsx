import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import { trpc } from "@/utils/trpc";
import { useSession, signIn, signOut } from "next-auth/react"
import { Button, Typography } from "@material-tailwind/react";

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
  const { data: session } = useSession();
  const [itemName, setItemName] = useState<string>("");
  const [accountEdit, setAccountEdit] = useState<string>("");
  const [idToEdit, setIdToEdit] = useState<string>("");
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
  const deleteOneMutation = trpc.deleteOne.useMutation( {
    onSuccess: () => refetch(),
  });

  const insertOne = useCallback(() => {
    if (itemName === "") return;

    insertMutation.mutate({
      account: itemName,
    });

    setItemName("");
  }, [itemName, insertMutation]);

  const deleteSome = useCallback(() => {
    if (list?.length) {
      let temp = list.filter((item) => item.checked===true); // all items to be deleted
      if(temp.length===0) alert("No item(s) to be deleted. Please check the item(s) first.");
      else{
        let text = "Do you want to delete selected items?";
        if (window.confirm(text) == true) {
          deleteAllMutation.mutate({
            ids: temp.map((item) => item.id),
          });
        }
      }
    }
  }, [list, deleteAllMutation]);

  const deleteAll = useCallback(() => {
    if (list?.length) {
      let text = "Are you sure you want to DELETE ALL items?";
      if (window.confirm(text) == true) {
        deleteAllMutation.mutate({
          ids: list.map((item) => item.id),
        });
      }
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

  const handleEditClick = useCallback(
    (item: CustomerList) => {
      setIsEditing(true);
      setIdToEdit(item.id);
    },
    []
  );

  const handleDeleteClick = useCallback(
    (item: CustomerList) => {
      let text = "Do you want to delete this item?";
      if (window.confirm(text) == true) {
        deleteOneMutation.mutate({
          ...item,
          id: item.id,
        });
      }else return;
      
    },
    [deleteOneMutation]
  );

  function handleCancelEdit() {
    // set editing to true
    setIsEditing(false);
  };

  const setCustomerAccount = useCallback(
    (account: string) => {
      setAccountEdit(account)
    },
    []
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
    [updateOneMutation, accountEdit]
  );

  if (!session){
    return (
      <div className="h-screen flex flex-col justify-center items-center ">
        <Typography color="blue-gray" className="mb-4 font-normal">
            Not signed in <br />
        </Typography>
        <Button onClick={() => signIn()}>Sign in</Button>
      </div>
    )
  }
  return (
    
    <>
      <div className="flex flex-col">
        <Typography color="blue-gray" className="font-normal">
            Signed in as {session?.user?.email} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </Typography>
      </div>

      <Head>
      <title>Customer List</title>
      <link rel="icon" href="/favicon.ico" />
      </Head>

    <main>
      <Card>
        <CardContent>
          <CardHeader
            title="Customer List"
            listLength={list?.length ?? 0}
            deleteAllFn={deleteAll}
            deleteSomeFn={deleteSome}
          />
          <List>
            {list?.map((item) => (
              !(isEditing&&item.id===idToEdit)?
              <ListItem key={item.id} item={item} onUpdate={updateOne} editTodo={handleEditClick} deleteTodo={handleDeleteClick} />
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