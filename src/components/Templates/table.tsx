import { Box, Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { RecipeTemplateWithRecipeFlows } from "../../apollo/__generated__/graphql";

interface RecipeTemplatesProps {
    recipes: Array<RecipeTemplateWithRecipeFlows>;
}

const RecipeTemplatesTable = ({ recipes }: RecipeTemplatesProps) => {
    const router = useRouter();

    const onViewClick = (recipe_template_id: string) => {
        router.push({
            pathname: '/recipe_template',
            query: { recipe_template_id },
        }, `/recipe_template/${recipe_template_id}`);
    }

    const onAssignClick = (recipe_template_id: string) => {
    }

    return (
        <Box maxWidth="80%" textAlign="center" margin="2em auto">
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr >
                            <Th>ID</Th>
                            <Th>Name</Th>
                            <Th>Type</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {recipes.map((r) => (
                            <Tr key={r.id} >
                                <Td>{r.id}</Td>
                                <Td>{r.name}</Td>
                                <Td>{r.recipeTemplateType}</Td>
                                <Td>
                                <Button colorScheme="teal" onClick={() => onViewClick(r.id)} style={{marginRight: "1em"}}>View</Button>
                                <Button colorScheme="teal" onClick={() => onAssignClick(r.id)} >Assign</Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RecipeTemplatesTable