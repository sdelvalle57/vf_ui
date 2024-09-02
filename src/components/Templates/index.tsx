import { Alert,  Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { RecipeWithResources, useRecipesByAgentQuery } from "../../apollo/__generated__/graphql"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import NewTemplate from "./new";


const RecipesComponent = () => {
    // const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);
    
    // const { loading, data, error } = useRecipesByAgentQuery({
    //     variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
    //     skip: !selectedAgent,
    //     pollInterval: 5000  // Skip the query if selectedAgent is null
    // });

    // const [recipes, setRecipes] = useState<Array<RecipeWithResources>>([]);

    // useEffect(() => {
    //     if(data?.recipesByAgent) {
    //         setRecipes(data.recipesByAgent)
    //     }
    // }, [data?.recipesByAgent])

    // if (error) return <Alert status='error'>{error.message}</Alert>
    // if (loading) return <Spinner />
    // if(data) {
        return (
            <div >

                <Tabs>
                    <TabList>
                        <Tab>Tenplates</Tab>
                        <Tab>New Template</Tab>
                    </TabList>
    
                    <TabPanels>
                        <TabPanel>
                        </TabPanel>
                        <TabPanel><NewTemplate /></TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        )
    // }
    return null;
}
export default RecipesComponent