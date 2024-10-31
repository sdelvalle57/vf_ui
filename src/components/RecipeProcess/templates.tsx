import { useEffect, useState } from "react";
import { RecipeTemplateWithRecipeFlows, useGetTemplatesAccessByAgentQuery } from "../../apollo/__generated__/graphql";
import { Alert, Box, Button, Card, CardBody, Heading, Spinner, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";


interface Props {
    onAddTemplate: (template: RecipeTemplateWithRecipeFlows) => void
}

const TemplatesComponent = ({ onAddTemplate }: Props) => {

    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);
    const { loading, data, error } = useGetTemplatesAccessByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },
        skip: !selectedAgent,
        pollInterval: 5000
    })

    const [templates, setTemplates] = useState<Array<RecipeTemplateWithRecipeFlows>>([]);

    useEffect(() => {
        if (data?.getTemplatesAccessByAgent) {
            setTemplates(data.getTemplatesAccessByAgent)
        }
    }, [data?.getTemplatesAccessByAgent])

    const addTemplate = (template: RecipeTemplateWithRecipeFlows) => {
        onAddTemplate(template);
    }


    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if (data) return (
        <Box width="20%" padding="2em" borderRight="1px solid #ccc" overflowY="auto">
            {templates.map((recipe) => (
                <Button
                    key={recipe.id}
                    width="100%"
                    marginBottom="1em"
                    padding="1.5em"
                    boxShadow="md"
                    _hover={{
                        backgroundColor: 'teal.500',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: 'lg',
                    }}
                    _active={{
                        transform: 'scale(0.98)',
                    }}
                    onClick={() => onAddTemplate(recipe)} >
                    {recipe.name}
                </Button>
            ))}
        </Box>
    )
    return null
}

export default TemplatesComponent;