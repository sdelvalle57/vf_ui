import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react"
import { Location, Recipe, RecipeProcessFlowResponse, RecipeProcessResponse, ResourceSpecification, RoleType, useLocationsByAgentQuery } from "../../apollo/__generated__/graphql"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import FormComponent, { ProcessFlowWithDataFieldValues } from "./form";

interface Props {
    isOpen: boolean,
    onClose: () => void,
    process: RecipeProcessResponse | null,
    recipe: Recipe,
    resources: Array<ResourceSpecification>
}

const ProcessModal = ({ isOpen, onClose, process, recipe, resources }: Props) => {
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);

    const [locations, setLocations] = useState<Array<Location>>([]);

    const { data } = useLocationsByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
        skip: !selectedAgent,
        pollInterval: 5000  // Skip the query if selectedAgent is null
    });

    useEffect(() => {
        if (data?.locationsByAgent) {
            setLocations(data.locationsByAgent);
        }
    }, [data]);

    const onFormSave = async (dataFieldValues: Array<ProcessFlowWithDataFieldValues>): Promise<boolean> =>  {
        console.log(dataFieldValues)
        return true
    }

    

    const renderProcessFlows = (flows: Array<RecipeProcessFlowResponse>) => {
        return (
            <div>
                <div key={1}>
                <FormComponent 
                    locations={locations}
                    onFormSave={onFormSave}
                    processFlows={flows.filter(f => f.roleType === RoleType.Input)}
                    resources={resources} />
                </div>
                <div key={2}>
                <FormComponent 
                    locations={locations}
                    onFormSave={onFormSave}
                    processFlows={flows.filter(f => f.roleType === RoleType.Output)}
                    resources={resources} />
                </div>
            </div>
        )
    }

    if (process) {
        return (
            <Modal closeOnOverlayClick={false} id="view_process_modal" onClose={onClose} size={"xl"} isOpen={isOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{`${process.name}(${process.recipeType})`}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {renderProcessFlows(process.processFlows)}
                    </ModalBody>
                    <ModalFooter>
                        <Button marginRight={"15px"} onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    }
    return null;

}

export default ProcessModal