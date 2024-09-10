import { Alert, AlertDescription, Box, Button, CloseButton, FormControl, FormLabel, Textarea, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { parseRecipeFlows, parseJson } from "./parser";
import { useCreateRecipeTemplateMutation } from "../../apollo/__generated__/graphql";

const NewTemplate = () => {
    // Correct order: [state, setState]
    const [jsonDocument, setJsonDocument] = useState('')
    const [error, setError] = useState<string | null>(null)
    const toast = useToast();

    const [createRecipeTemplate, { loading, error: createError }] = useCreateRecipeTemplateMutation({
        onCompleted: (data) => {
            console.log(data)
            toast({
                title: "Recipe template created.",
                description: `Recipe ${data.createRecipeTemplate.name} was successfully created.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setJsonDocument('');
        },
        onError: (e) => {
            console.log(e)
            setError(e.message)
        }
    });

    console.log(createError)

    const setJsonDocumentValue = (val: string) => {
        setJsonDocument(val);
        setError(null)
    }

    const handleJSON = async (event: React.FormEvent) => {
        event.preventDefault();
        // You can handle the JSON document here
        
        try {
            const doc = parseJson(jsonDocument)
            
            console.log({
                variables: {
                    name: doc.name,
                    recipeTemplateType: doc.type,
                    recipeFlowTemplateArgs: parseRecipeFlows(doc.events),
                }
            })
            await createRecipeTemplate({
                variables: {
                    name: doc.name,
                    recipeTemplateType: doc.type,
                    recipeFlowTemplateArgs: parseRecipeFlows(doc.events),
                },
            });
        } catch (e: any) {
            setError(e.message)
        }
    }

    if (error) {
        return (
            <Alert status='success'>
                <Box>
                    <AlertDescription>{error}</AlertDescription>
                </Box>
                <CloseButton
                    alignSelf='flex-start'
                    position='relative'
                    right={-1}
                    top={-1}
                    onClick={() => setError(null)}
                />
            </Alert>
        )
    }




    return (
        <Box className="json_file" maxWidth="400px" mx="auto" mt="5">
            <form onSubmit={handleJSON}>
                <FormControl id="note" mt={4} display="flex" flexDirection="column" flex="1">
                    <FormLabel>Enter JSON File</FormLabel>
                    <Textarea
                        placeholder="Enter JSON here"
                        value={jsonDocument}
                        onChange={(e) => setJsonDocumentValue(e.target.value)}
                        flex="1"
                    />
                </FormControl>
                <Button mt={4} colorScheme="teal" type="submit">
                    Create Template
                </Button>
            </form>
        </Box>
    )
}

export default NewTemplate;