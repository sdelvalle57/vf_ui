import { Alert, Box, Heading, Spinner, Tab, Table, TableContainer, TabList, TabPanel, TabPanels, Tabs, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { EconomicResource, ResourceSpecification, useEconomicResourcesBySpecificationIdLazyQuery } from "../../apollo/__generated__/graphql"
import { useEffect, useState } from "react";
import EconomicResourcesTable from "./table";
import NewEconomicResource from "./new";

interface Props {
    resourceSpecification: ResourceSpecification,
}

const EconomicResourcesElement = ({ resourceSpecification }: Props) => {
    const [fetchEconomicResources, { loading, data, error }] = useEconomicResourcesBySpecificationIdLazyQuery();
    const [economicResources, setEconomicResources] = useState<Array<EconomicResource>>([]);

    useEffect(() => {
        const get = async () => {
            await fetchEconomicResources({
                variables: {
                    resourceSpecificationId: resourceSpecification.id
                }
            });
        }
        get();
    }, [resourceSpecification])

    useEffect(() => {
        if (data?.economicResourcesBySpecificationId) {
            setEconomicResources(data.economicResourcesBySpecificationId);
        }
    }, [data]);

    const onNewEconomicResource = (economiResource: EconomicResource) => {
        setEconomicResources([...economicResources, economiResource])
    }

    

    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if(economicResources) {
        return (
            <div >
                <Heading style={{ textAlign: "center", marginBottom: "3em" }} as='h3' size='lg'>Economic Resources of {resourceSpecification.name}</Heading>

                <Tabs>
                    <TabList>
                        <Tab>Economic Resources</Tab>
                        <Tab>New Economic Resource</Tab>
                    </TabList>
    
                    <TabPanels>
                        <TabPanel>
                            <EconomicResourcesTable economicResources={economicResources}/>
                        </TabPanel>
                        <TabPanel>
                            <NewEconomicResource 
                                resourceSpecification={resourceSpecification} 
                                onNewEconomicResource={onNewEconomicResource}
                            />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        )
    }
    return null;
}
export default EconomicResourcesElement