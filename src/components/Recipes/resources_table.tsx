import { Box, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { RecipeWithResources } from "../../apollo/__generated__/graphql";
import moment from "moment";


interface EconomicResourcesProps {
    recipe: RecipeWithResources
}


const RecipeResourcesTable = (props: EconomicResourcesProps) => {

    const { recipe} = props
    console.log(recipe)

    return (
        <Box maxWidth="100%" overflowX="auto">
                <TableContainer>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Name</Th>
                                <Th>Resource Type</Th>
                                <Th>Note</Th>
                                <Th>Created At</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {recipe.resourceSpecifications.map((resource) => (
                                <Tr key={resource.id}>
                                    <Td>{resource.id}</Td>
                                    <Td>{resource.name}</Td>
                                    <Td>{resource.resourceType}</Td>
                                    <Td>{resource.note || 'N/A'}</Td>
                                    <Td>{moment.unix(resource.createdAt).format("DD-MM-YYYY")}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
    )
}

export default RecipeResourcesTable;