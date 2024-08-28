import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { ResourceSpecification, useResourceSpecificationsByAgentQuery } from "../../apollo/__generated__/graphql";
import { useEffect, useState } from "react";
import { Alert, Box, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import ResourceSpecificationsTable from "./table";
import CreateResourceSpecificationForm from "./new";

const ResourcesComponent = () => {
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);
    

    const { data, loading, error } = useResourceSpecificationsByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
        skip: !selectedAgent,
        pollInterval: 5000  // Skip the query if selectedAgent is null
    });

    const [resourceSpecifications, setResourceSpecifications] = useState<Array<ResourceSpecification>>([]);


    useEffect(() => {
        if (data?.resourceSpecificationsByAgent) {
            setResourceSpecifications(data.resourceSpecificationsByAgent);
        }
    }, [data]);

    if (!selectedAgent) {
        return <Alert status="warning">No agent selected. Please select an agent to view resource specifications.</Alert>;
    }

    if (error) return <Alert status="error">{error.message}</Alert>;
    if (loading) return <Spinner />;
    if (!data) return null;

    return (
        <Box>
            <Tabs>
                <TabList>
                    <Tab>Resource Specifications</Tab>
                    <Tab>New Resource Specification</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <ResourceSpecificationsTable resources={resourceSpecifications} />
                    </TabPanel>
                    <TabPanel>
                        <CreateResourceSpecificationForm agent={selectedAgent} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default ResourcesComponent