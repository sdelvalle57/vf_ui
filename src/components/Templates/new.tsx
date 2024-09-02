import { Alert, AlertDescription, Box, Button, CloseButton, FormControl, FormLabel, Textarea, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { parseJson } from "./types";

const NewTemplate = () => {
    // Correct order: [state, setState]
    const [jsonDocument, setJsonDocument] = useState('')
    const [error, setError] = useState<string | null>(null)


    const setJsonDocumentValue = (val: string) => {
        setJsonDocument(val);
        setError(null)
    }

    const handleJSON = (event: React.FormEvent) => {
        event.preventDefault();
        // You can handle the JSON document here
        try {
            const doc = parseJson(jsonDocument)
            console.log(doc)
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