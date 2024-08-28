import React, { ReactNode, useEffect, useState } from "react";
import { Alert, Box, Button, Spinner, Stack } from "@chakra-ui/react";
import Header from "./Header";
import { Agent, useAllAgentsQuery } from "../apollo/__generated__/graphql";
import { useDispatch } from "react-redux";
import { selectAgent } from "../redux/selectedAgent";

interface PageProps {
  children: ReactNode;
}


export default function Layout(props: PageProps) {
  const { data, loading, error } = useAllAgentsQuery();
  const dispatch = useDispatch();

  const [agents, setAgents] = useState<Array<Agent>>();

  useEffect(() => {
    if (data?.allAgents) {
      console.log("aca")
      setAgents(data.allAgents);
    }
  }, [data]);


  useEffect(() => {
    const storageSelectedAgent = localStorage.getItem('selected_agent');
    if (storageSelectedAgent && agents) {
      const agent = agents.find(a => a.id === storageSelectedAgent);
      if (agent) dispatch(selectAgent(agent))
    }
  }, [agents])


  if (error) return <Alert status='error'>{error.message}</Alert>
  if (loading) return <Spinner />
  if (!data) return null;

  return (
    <div>
      <Header />
      <Stack spacing="8">
        <Box
          py={{ base: "0", sm: "8" }}
          px={{ base: "0", sm: "10" }}
          bg={{ base: "#f1f3f4", sm: "bg-surface" }}
          boxShadow={{ base: "none", sm: "md" }}
          borderRadius={{ base: "none", sm: "xl" }}
        >
          <Stack spacing="12">
            <Stack spacing="6">
              {props.children}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </div>
  );
}
