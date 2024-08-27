import type { NextPage } from 'next'
import { Agent, useAllAgentsQuery, useCreateAgentMutation } from '../apollo/__generated__/graphql'
import { Alert, Box, Button, FormControl, FormLabel, Input, Spinner, Tab, Table, TableContainer, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Textarea, Th, Thead, Tr, useToast } from '@chakra-ui/react';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { selectAgent } from '../redux/selectedAgent';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/rootReducer';


const IndexPage: NextPage = () => {
    const { data, loading, error } = useAllAgentsQuery();
    
    const [agents, setAgents] = useState<Array<Agent>>([]);

    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if (!data) return null;

    useEffect(() => {
        if(data.allAgents) {
            setAgents(data.allAgents)
        }
    }, [data]);

    const onNewAgent = (agent: Agent) => {
        setAgents([...agents, agent]);
    }

    return (
        <div >
            <Tabs>
                <TabList>
                    <Tab>Agents</Tab>
                    <Tab>New Agent</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <AgentsTable agents={agents}  />
                    </TabPanel>
                    <TabPanel>
                        <CreateAgent onNewAgent={onNewAgent} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    )
}

export default IndexPage


interface AgentsTableProps {
    agents: Array<Agent>
}
const AgentsTable = (props: AgentsTableProps) => {
    const dispatch = useDispatch();
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);

    const renderSelectAgentButton = (a: Agent) => {
        if(selectedAgent && selectedAgent.id === a.id) return <Button disabled={true}>Selected</Button>
        return <Button colorScheme='blue' onClick={() => dispatch(selectAgent(a))}>Select</Button>
    }

    return (
        <TableContainer style={{maxWidth: "80%", textAlign: "center", margin: "2em auto 2em auto"}}>
            <Table>
                <Thead>
                    <Tr>
                        <Th>Id</Th>
                        <Th>Name</Th>
                        <Th>Note</Th>
                        <Th>CreatedAt</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    
                    {
                        props.agents.map(a => {
                            const date = moment.unix(a.createdAt).format("DD-MM-YYYY")
                            return (
                                <Tr key={a.id}>
                                    <Td>{a.id}</Td>
                                    <Td>{a.name}</Td>
                                    <Td>{a.note}</Td>
                                    <Td>{date}</Td>
                                    <Td>{renderSelectAgentButton(a)}</Td>
                                </Tr>
                            )
                        })
                    }
                </Tbody>
            </Table>
        </TableContainer>
    )
}

interface CreateAgentProps {
    onNewAgent: (agent: Agent) => void,
}

const CreateAgent = (props: CreateAgentProps) => {
    const [name, setName] = useState('');
    const [note, setNote] = useState('');
    const toast = useToast();

    const [createAgent, { loading, error }] = useCreateAgentMutation({
        onCompleted: (data) => {
          toast({
            title: "Agent created.",
            description: `Agent ${data.createAgent.name} was successfully created.`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          props.onNewAgent(data.createAgent);
          setName('');
          setNote('');
        },
      });

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          await createAgent({ variables: { name, note } });
          
        } catch (err: any) {
          toast({
            title: "An error occurred.",
            description: err.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      };

      return (
        <Box maxWidth="400px" mx="auto" mt="5">
          <form onSubmit={handleSubmit}>
            <FormControl id="name" isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter agent name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl id="note" mt={4}>
              <FormLabel>Note</FormLabel>
              <Textarea
                placeholder="Enter a note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </FormControl>
            <Button
              mt={4}
              colorScheme="teal"
              isLoading={loading}
              type="submit"
            >
              Create Agent
            </Button>
            {error && <Box mt={4} color="red.500">Error: {error.message}</Box>}
          </form>
        </Box>
      )
}