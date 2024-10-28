import { Alert,  Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useGetMapTemplatesQuery } from "../../apollo/__generated__/graphql"
import NewMapTemplate from "./new";
import MapTemplateTables from "./map_templates_table";


const RecipeTemplatesComponent = () => {
    // const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);
    
    const { loading, data, error } = useGetMapTemplatesQuery({
        pollInterval: 5000  
    });
    


    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if(data) {
        return (
            <div >

                <Tabs>
                    <TabList>
                        <Tab>Templates</Tab>
                        <Tab>New Template</Tab>
                    </TabList>
    
                    <TabPanels>
                        <TabPanel><MapTemplateTables mapTemplates={data.getMapTemplates}/></TabPanel>
                        <TabPanel><NewMapTemplate /></TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        )
    }
    return null;
}
export default RecipeTemplatesComponent