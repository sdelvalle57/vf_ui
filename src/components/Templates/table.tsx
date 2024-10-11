import { Alert, Box, Button, Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { RecipeTemplateWithRecipeFlows, useAssignTemplateToAgentMutation, useGetTemplatesAccessByAgentQuery } from "../../apollo/__generated__/graphql";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { useEffect } from "react";

interface RecipeTemplatesProps {
    templates: Array<RecipeTemplateWithRecipeFlows>;
    noAction?: boolean
}

const RecipeTemplatesTable = ({ templates, noAction }: RecipeTemplatesProps) => {
    const router = useRouter();
    const toast = useToast();
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);


    const { loading, data, error: queryError } = useGetTemplatesAccessByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
        skip: !selectedAgent,
        pollInterval: 5000  // Skip the query if selectedAgent is null
    });

    const [assignRecipeTemplate, { error }] = useAssignTemplateToAgentMutation({
        onCompleted: (data) => {
            if (data) {
                toast({
                    title: "Assign recipe template",
                    description: `Recipe template was successfully assigned.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    })

    useEffect(() => {
        if (error) {
            toast({
                title: "Error assigning template",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [error])

    const onViewClick = (recipe_template_id: string) => {
        router.push({
            pathname: '/recipe_template',
            query: { recipe_template_id },
        }, `/recipe_template/${recipe_template_id}`);
    }

    const onAssignClick = async (recipe_template_id: string) => {
        await assignRecipeTemplate({
            variables: {
                agentId: selectedAgent?.id,
                recipeTemplateId: recipe_template_id
            }
        })
    }
        
    const getAssignButton = (recipe_template_id: string) => {
        if(noAction) return null;
        if(data) {
            if(data.getTemplatesAccessByAgent.find(t => t.id === recipe_template_id)) {
                return <Button disabled>Assigned</Button>
            }
        }
        return <Button colorScheme="teal" onClick={() => onAssignClick(recipe_template_id)} >Assign</Button>
    }

    if (queryError) return <Alert status='error'>{queryError.message}</Alert>
    if (loading) return <Spinner />
    if(data) {
        return (
            <Box maxWidth="80%" textAlign="center" margin="2em auto">
                <TableContainer>
                    <Table>
                        <Thead>
                            <Tr >
                                <Th>ID</Th>
                                <Th>Name</Th>
                                <Th>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {templates.map((r) => (
                                <Tr key={r.id} >
                                    <Td>{r.id}</Td>
                                    <Td>{r.name}</Td>
                                    <Td>
                                        <Button colorScheme="teal" onClick={() => onViewClick(r.id)} style={{ marginRight: "1em" }}>View</Button>
                                        {getAssignButton(r.id)}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
        );
    }
    return null;
};

export default RecipeTemplatesTable