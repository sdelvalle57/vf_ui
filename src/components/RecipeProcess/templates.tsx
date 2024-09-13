import { useEffect, useState } from "react";
import { RecipeTemplateWithRecipeFlows, useGetTemplatesAccessByAgentQuery } from "../../apollo/__generated__/graphql";
import { Alert, Card, CardBody, Heading, Spinner, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";


interface Props {
    onAddProcess: (template: RecipeTemplateWithRecipeFlows) => void
}

const TemplatesComponent = ({ onAddProcess }: Props) => {

    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);
    const { loading, data, error } = useGetTemplatesAccessByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },
        skip: !selectedAgent,
        pollInterval: 5000
    })

    const [recipeTemplates, setRecipeTemplates] = useState<Array<RecipeTemplateWithRecipeFlows>>([]);

    useEffect(() => {
        if (data?.getTemplatesAccessByAgent) {
            setRecipeTemplates(data.getTemplatesAccessByAgent)
        }
    }, [data?.getTemplatesAccessByAgent])

    const addTemplate = (template: RecipeTemplateWithRecipeFlows) => {
        onAddProcess(template);
    }


    const renderTemplates = () => {
        return recipeTemplates.map(r => {
            return (
                <Card onClick={() => addTemplate(r)} className="new_process_card" key={r.id}>
                    <Heading size='xs' textTransform='uppercase'>
                        {r.name}
                    </Heading>
                    <CardBody>
                        <Text>{r.recipeTemplateType}</Text>
                    </CardBody>
                </Card>
            )
        })
    }

    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if (data) return renderTemplates()
    return null
}

export default TemplatesComponent;