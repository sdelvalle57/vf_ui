import { Alert, Box, Button, FormControl, FormLabel, Input, Select, Spinner, Textarea, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useCreateRecipeMutation, RecipeWithResources, useResourceSpecificationsByAgentQuery, ResourceSpecification } from "../../apollo/__generated__/graphql";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { DeleteIcon } from "@chakra-ui/icons";

interface Props {
    onNewRecipe: (recipe: RecipeWithResources) => void;
}

const NewRecipe = ({ onNewRecipe }: Props) => {
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);
    const { data: reData, loading: reLoading, error: reError } = useResourceSpecificationsByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },
        skip: !selectedAgent,
    })

    const [name, setName] = useState('');
    const [note, setNote] = useState('');
    const [resourceSpecifications, setResourceSpecifications] = useState<Array<ResourceSpecification>>([])
    const toast = useToast();

    const [createRecipe, { loading, error }] = useCreateRecipeMutation({
        onCompleted: (data) => {
            toast({
                title: "Recipe created.",
                description: `Recipe ${data.createRecipe.recipe.name} was successfully created.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            onNewRecipe(data.createRecipe);
            setName('');
            setNote('');
            setResourceSpecifications([]);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRecipe({
                variables: {
                    agentId: selectedAgent?.id,
                    name,
                    note,
                    recipeResources: resourceSpecifications.map(r => r.id),
                },
            });
        } catch (err: any) {
            toast({
                title: "An error occurred.",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const addNewResource = (r: ResourceSpecification) => {
        setResourceSpecifications([...resourceSpecifications, r]);
    }

    const removeResource = (r: ResourceSpecification) => {
        setResourceSpecifications(resourceSpecifications.filter(re => re.id !== r.id));
    }

    const renderSelectedResourceSpecifications = () => {
        return resourceSpecifications.map(r => {
            return(
                <div style={{marginTop: "1em"}} key={r.id}>
                    <small>{r.name}</small> 
                    <DeleteIcon onClick={() => removeResource(r)} style={{marginLeft: "2em", cursor:"pointer"}}/>
                </div>
            )
        })
    }

    if (reError) return <Alert status="error">{reError.message}</Alert>
    if (reLoading) return <Spinner />
    if (reData) {
        if (reData.resourceSpecificationsByAgent.length === 0) return <Alert status="warning">There are no resource specifaction created by this agent</Alert>

        const selectData = reData.resourceSpecificationsByAgent.filter(r => {
            const found = resourceSpecifications.find(rs => rs.id === r.id);
            if(found) return null
            return r;
        });

        return (
            <Box maxWidth="400px" mx="auto" mt="5">
                <form onSubmit={handleSubmit}>
                    <FormControl id="name" isRequired mt={4}>
                        <FormLabel>Name</FormLabel>
                        <Input
                            placeholder="Enter recipe name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormControl>
                    <FormControl id="note" mt={4}>
                        <FormLabel>Note</FormLabel>
                        <Textarea
                            placeholder="Enter a note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </FormControl>
                    <FormControl style={{ marginTop: "2em" }}>
                        <FormLabel>Resource Specifications</FormLabel>
                        <Select placeholder='Select Resource Specifications'>
                            {
                                selectData.map((r) => {
                                    return (
                                        <option onClick={()=> addNewResource(r)} key={r.id} value={r.id}>{r.name}</option>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>

                   {renderSelectedResourceSpecifications()}
                   
                    <Button
                        mt={4}
                        colorScheme="teal"
                        isLoading={loading}
                        type="submit" >
                        Create Recipe
                    </Button>
                    {error && <Box mt={4} color="red.500">Error: {error.message}</Box>}
                </form>
            </Box>
        );
    }
    return null;
};

export default NewRecipe;
