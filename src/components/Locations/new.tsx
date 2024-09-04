import { Box, Button, FormControl, FormLabel, Input, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useCreateLocationMutation } from "../../apollo/__generated__/graphql";

interface Props {
    agentId: string
}
export const NewLocationComponent = ({ agentId }: Props) => {
    const toast = useToast();

    const [name, setName] = useState("");
    const [value, setValue] = useState("");

    const [createLocation, { loading, error }] = useCreateLocationMutation({
        onCompleted: (data) => {
            toast({
                title: "Location created.",
                description: `Location ${data.createLocation.name} was successfully created.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setName('');
            setValue('');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createLocation({
                variables: {
                    agentId,
                    name,
                    value
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
                        placeholder="Enter location name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </FormControl>
                <FormControl id="note" mt={4}>
                    <FormLabel>Value</FormLabel>
                    <Input
                        placeholder="Enter location value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </FormControl>
              
                <Button
                    mt={4}
                    colorScheme="teal"
                    isLoading={loading}
                    type="submit" >
                    Create Location
                </Button>
                {error && <Box mt={4} color="red.500">Error: {error.message}</Box>}
            </form>
        </Box>
    );
}