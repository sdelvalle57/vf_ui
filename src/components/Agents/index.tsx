import { useEffect, useState } from "react";
import { Agent, useAllAgentsQuery } from "../../apollo/__generated__/graphql";
import { Alert, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import AgentsTable from "./table";
import CreateAgent from "./new";


const AgentComponent = () => {
    const { data, loading, error } = useAllAgentsQuery({
        pollInterval: 5000
    });

    const [agents, setAgents] = useState<Array<Agent>>([]);

    useEffect(() => {
        if (data?.allAgents) {
            setAgents(data.allAgents);
        }
    }, [data]);

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
                        <AgentsTable agents={agents} />
                    </TabPanel>
                    <TabPanel>
                        <CreateAgent />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    )
}

export default AgentComponent;