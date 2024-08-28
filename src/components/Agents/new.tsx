import { useState } from "react";
import { Agent, useCreateAgentMutation } from "../../apollo/__generated__/graphql";
import { Box, Button, FormControl, FormLabel, Input, Textarea, useToast } from "@chakra-ui/react";

interface CreateAgentProps {
    onNewAgent: (agent: Agent) => void,
}

const CreateAgent = (props: CreateAgentProps) => {
    const [name, setName] = useState('');
    const [note, setNote] = useState('');
    const toast = useToast();

    const [createAgent, { loading, error }] = useCreateAgentMutation({
        onCompleted: (data) => {
            toast({
                title: "Agent created.",
                description: `Agent ${data.createAgent.name} was successfully created.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            props.onNewAgent(data.createAgent);
            setName('');
            setNote('');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAgent({ variables: { name, note } });

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
                <FormControl id="name" isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                        placeholder="Enter agent name"
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
                <Button
                    mt={4}
                    colorScheme="teal"
                    isLoading={loading}
                    type="submit"
                >
                    Create Agent
                </Button>
                {error && <Box mt={4} color="red.500">Error: {error.message}</Box>}
            </form>
        </Box>
    )
}

export default CreateAgent;