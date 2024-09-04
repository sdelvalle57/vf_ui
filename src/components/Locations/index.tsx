import { useEffect, useState } from "react";
import { Location, useLocationsByAgentQuery } from "../../apollo/__generated__/graphql";
import { Alert, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import LocationsTable from "./table";
import { NewLocationComponent } from "./new";


const LocationsComponent = () => {

    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);
    const [locations, setLocations] = useState<Array<Location>>([]);
    
    const { loading, data, error } = useLocationsByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
        skip: !selectedAgent,
        pollInterval: 5000  // Skip the query if selectedAgent is null
    });

    useEffect(() => {
        if (data?.locationsByAgent) {
            setLocations(data.locationsByAgent);
        }
    }, [data]);

    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if (!data || !selectedAgent) return null;

    return (
        <div >
            <Tabs>
                <TabList>
                    <Tab>Locations</Tab>
                    <Tab>New Location</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                       <LocationsTable locations={locations} />
                    </TabPanel>
                    <TabPanel>
                        <NewLocationComponent agentId={selectedAgent.id} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    )
}

export default LocationsComponent;