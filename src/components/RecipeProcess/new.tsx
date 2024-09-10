import { useEffect, useState } from "react";
import { RecipeTemplateWithRecipeFlows, useGetTemplatesAccessByAgentQuery, useGetTemplatesQuery } from "../../apollo/__generated__/graphql";
import { Alert, Button, Card, CardBody, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";


interface Props {
    isOpen: boolean,
    onClose: () => void,
    onAddProcess: (template: RecipeTemplateWithRecipeFlows) => void
}

const NewProcessComponent = ({ isOpen, onClose, onAddProcess }: Props) => {

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
        onClose()
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
    if (data) {
        return (
            <Modal id="sel_template" onClose={onClose} size={"xl"} isOpen={isOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Select Template</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {renderTemplates()}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    }
    return null
}

export default NewProcessComponent;