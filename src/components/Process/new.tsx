import { useEffect, useState } from "react";
import { RecipeTemplateWithRecipeFlows, useGetTemplatesQuery } from "../../apollo/__generated__/graphql";
import { Alert, Button, Card, CardBody, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text } from "@chakra-ui/react";


interface Props {
    isOpen: boolean,
    onClose: () => void,
    onAddTemplate: (template: RecipeTemplateWithRecipeFlows) => void
}

const NewProcessComponent = ({ isOpen, onClose, onAddTemplate }: Props) => {

    const { loading, data, error } = useGetTemplatesQuery({
        pollInterval: 5000
    })

    const [recipeTemplates, setRecipeTemplates] = useState<Array<RecipeTemplateWithRecipeFlows>>([]);

    useEffect(() => {
        if (data?.getTemplates) {
            setRecipeTemplates(data.getTemplates)
        }
    }, [data?.getTemplates])

    const addTemplate = (template: RecipeTemplateWithRecipeFlows) => {
        onAddTemplate(template);
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