import { Alert,  Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { RecipeTemplateWithRecipeFlows, useGetTemplatesQuery } from "../../apollo/__generated__/graphql"
import { useEffect, useState } from "react";
import NewTemplate from "./new_template";
import RecipeTemplatesTable from "./table";
import NewMapTemplate from "./new";
import MapTemplateTables from "./map_templates_table";


const RecipeTemplatesComponent = () => {
    // const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);
    
    const { loading, data, error } = useGetTemplatesQuery({
        pollInterval: 5000  
    })
    
    const [recipeTemplates, setRecipeTemplates] = useState<Array<RecipeTemplateWithRecipeFlows>>([]);

    useEffect(() => {
        if(data?.getTemplates) {
            setRecipeTemplates(data.getTemplates)
        }
    }, [data?.getTemplates])

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
                        <TabPanel><MapTemplateTables /></TabPanel>
                        <TabPanel><NewMapTemplate /></TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        )
    }
    return null;
}
export default RecipeTemplatesComponent