import { Alert, Box, Button, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { FieldClass, Location, FieldType, Recipe, RecipeFlowDataField, RecipeProcessFlowResponse, RecipeProcessResponse, ResourceSpecification, RoleType, useLocationsByAgentQuery, useResourceSpecificationByIdLazyQuery, ActionType } from "../../apollo/__generated__/graphql"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import FormComponent from "./form";

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

    

    const renderProcessFlows = (flows: Array<RecipeProcessFlowResponse>) => {
        return (
            <div>
                <div key={1}>
                <FormComponent 
                    locations={locations}
                    processFlows={flows.filter(f => f.roleType === RoleType.Input)}
                    resources={resources} />
                </div>
                <div key={2}>
                <FormComponent 
                    locations={locations}
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