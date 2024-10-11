import { Box, Button, FormControl, FormLabel, Input, Select, useToast } from "@chakra-ui/react";
import { TemplateType, useCreateMapTemplateMutation } from "../../apollo/__generated__/graphql";
import { useState } from "react";


const NewMapTemplate = () => {

    const [name, setName] = useState('');
    const [templateType, setTemplateType] = useState<TemplateType>(TemplateType.Fda);

    const toast = useToast();

    const [createMapTemplate, { loading, error }] = useCreateMapTemplateMutation({
        onCompleted: (data) => {
            toast({
                title: "Map template created.",
                description: `Map Template ${data.createMapTemplate.name} was successfully created.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setName('');
        },
    });



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMapTemplate({
                variables: {
                    name,
                    type: templateType,
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

                <FormControl isRequired style={{ marginTop: "2em" }}>
                    <FormLabel>Template Type</FormLabel>
                    <Select
                        value={templateType}
                        onChange={(e) => setTemplateType(e.target.value as TemplateType)} >
                        <option value={TemplateType.Fda}>FDA</option>
                        <option value={TemplateType.Custom}>Custom</option>
                    </Select>
                </FormControl>


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

export default NewMapTemplate;