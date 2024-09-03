import { Box, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/router";
import { RecipeTemplateWithRecipeFlows } from "../../apollo/__generated__/graphql";

interface RecipeTemplatesProps {
    recipes: Array<RecipeTemplateWithRecipeFlows>;
}

const RecipeTemplatesTable = ({ recipes }: RecipeTemplatesProps) => {
    const router = useRouter();

    const onRowClick = (recipe_id: string) => {
        // router.push({
        //     pathname: '/recipe_info',
        //     query: { recipe_id },
        // }, `/recipe_info/${recipe_id}`);
    }

    return (
        <Box maxWidth="80%" textAlign="center" margin="2em auto">
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>ID</Th>
                            <Th>Name</Th>
                            <Th>Type</Th>
                            <Th>Type</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {recipes.map((r) => (
                            <Tr className="recipe_row" key={r.id} onClick={() => onRowClick(r.id)}>
                                <Td>{r.id}</Td>
                                <Td>{r.name}</Td>
                                <Td>{r.recipeTemplateType}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RecipeTemplatesTable


/*
y creeme que conseguir buenos recursos no es facil, 

*/