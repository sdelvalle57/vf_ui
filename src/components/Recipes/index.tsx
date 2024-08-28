import { Alert,  Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { RecipeWithResources, useRecipesByAgentQuery } from "../../apollo/__generated__/graphql"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import RecipesTable from "./table";
import NewRecipe from "./new";


const RecipesComponent = () => {
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);
    
    const { loading, data, error } = useRecipesByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
        skip: !selectedAgent,  // Skip the query if selectedAgent is null
    });

    const [recipes, setRecipes] = useState<Array<RecipeWithResources>>([]);

    useEffect(() => {
        if(data?.recipesByAgent) {
            setRecipes(data.recipesByAgent)
        }
    }, [data?.recipesByAgent])

    

    const onNewRecipe = (recipe: RecipeWithResources) => {
        setRecipes([...recipes, recipe])
    }
    

    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if(data) {
        return (
            <div >

                <Tabs>
                    <TabList>
                        <Tab>Recipes</Tab>
                        <Tab>New Recipe</Tab>
                    </TabList>
    
                    <TabPanels>
                        <TabPanel>
                            <RecipesTable recipes={recipes} />
                        </TabPanel>
                        <TabPanel>
                            <NewRecipe onNewRecipe={onNewRecipe} />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        )
    }
    return null;
}
export default RecipesComponent