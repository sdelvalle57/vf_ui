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
        skip: !selectedAgent,  // Skip the query if selectedAgent is null
    });

    const [resourceSpecifications, setResourceSpecifications] = useState<Array<ResourceSpecification>>([]);
    const [selectedResource, setSelectedResource] = useState<ResourceSpecification | null>(null);


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

    const onNewResourceSpecification = (resource: ResourceSpecification) => {
        setResourceSpecifications([...resourceSpecifications, resource]);
    };

    const onSelectedResource = (selectedResource: ResourceSpecification) => {
        setSelectedResource(selectedResource)
    }

    if(selectedResource) {
        return <>{selectedResource.name}</>
    }

    return (
        <Box>
            <Tabs>
                <TabList>
                    <Tab>Resource Specifications</Tab>
                    <Tab>New Resource Specification</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <ResourceSpecificationsTable onSelectedResource={onSelectedResource} resources={resourceSpecifications} />
                    </TabPanel>
                    <TabPanel>
                        <CreateResourceSpecificationForm agent={selectedAgent} onNewResourceSpecification={onNewResourceSpecification} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default ResourcesComponent