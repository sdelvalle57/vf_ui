import type { NextPage } from 'next'
import { Agent, useAllAgentsQuery } from '../apollo/__generated__/graphql'
import { Alert, Button, Spinner, Tab, Table, TableContainer, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import moment from 'moment';


const IndexPage: NextPage = () => {
    const { data, loading, error } = useAllAgentsQuery();

    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if (!data) return null;


    return (
        <div >
            <Tabs>
                <TabList>
                    <Tab>Agents</Tab>
                    <Tab>New Agent</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <AgentsTable agents={data.allAgents} />
                    </TabPanel>
                    <TabPanel>
                        <p>two!</p>
                    </TabPanel>
                    <TabPanel>
                        <p>three!</p>
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
    const selectAgent = (agent: Agent) => {
        console.log(agent)
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
                                    <Td><Button onClick={() => selectAgent(a)}>Select</Button></Td>
                                </Tr>
                            )
                        })
                    }
                </Tbody>
            </Table>
        </TableContainer>
    )
}