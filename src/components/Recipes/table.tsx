import { Box, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import moment from "moment";
import { RecipeWithResources } from "../../apollo/__generated__/graphql";
import { useRouter } from "next/router";

interface RecipesTableProps {
    recipes: Array<RecipeWithResources>;
}

const RecipesTable = ({ recipes }: RecipesTableProps) => {
    const router = useRouter();

    const onRowClick = (recipe_id: string) => {
        router.push({
            pathname: '/recipe_info',
            query: { recipe_id },
        }, `/recipe_info/${recipe_id}`);
    }

    return (
        <Box maxWidth="80%" textAlign="center" margin="2em auto">
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>ID</Th>
                            <Th>Name</Th>
                            <Th>Note</Th>
                            <Th>Created At</Th>
                            <Th>Resources</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {recipes.map((r) => (
                            <Tr className="recipe_row" key={r.recipe.id} onClick={() => onRowClick(r.recipe.id)}>
                                <Td>{r.recipe.id}</Td>
                                <Td>{r.recipe.name}</Td>
                                <Td>{r.recipe.note}</Td>
                                <Td>{moment.unix(r.recipe.createdAt).format("DD-MM-YYYY")}</Td>
                                <Td>{r.resourceSpecifications.length}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RecipesTable


/*
y creeme que conseguir buenos recursos no es facil, 

*/