import { Box, Card, CardBody, Heading, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { RecipeWithResources } from "../../apollo/__generated__/graphql"
import moment from "moment"
import RecipeResourcesTable from "./resources_table"
import { ProcessesInfo } from "../Process/processes_info"

interface Props {
    recipe: RecipeWithResources
}

const RecipeInfo = ({ recipe }: Props) => {

    return (
        <Box>
            <Card style={{margin: "2em auto", textAlign:"center"}} maxW='sm'>
                <CardBody>
                    <Stack mt='6' spacing='3'>
                        <Heading size='md'>{recipe.recipe.name}</Heading>
                        <Text>{recipe.recipe.note}</Text>
                        <Text><strong>Created At: </strong>{moment.unix(recipe.recipe.createdAt).format("DD-MM-YYYY")}</Text>
                    </Stack>
                </CardBody>
            </Card>

            <Tabs style={{maxWidth: "80%", margin: "2em auto"}}>
                <TabList>
                    <Tab>Resources</Tab>
                    <Tab>Processes</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel><RecipeResourcesTable recipe={recipe} /></TabPanel>
                    <TabPanel><ProcessesInfo recipe={recipe}/></TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}

export default RecipeInfo