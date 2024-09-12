import { Alert, Box, Button, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { FieldClass, Location, FieldType, Recipe, RecipeFlowDataField, RecipeProcessFlowResponse, RecipeProcessResponse, ResourceSpecification, RoleType, useLocationsByAgentQuery, useResourceSpecificationByIdLazyQuery, ActionType } from "../../apollo/__generated__/graphql"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

interface Props {
    isOpen: boolean,
    onClose: () => void,
    process: RecipeProcessResponse | null,
    recipe: Recipe,
    resources: Array<ResourceSpecification>
}

const ProcessModal = ({ isOpen, onClose, process, recipe, resources }: Props) => {
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);

    const [ fetchResourceSpecification ] = useResourceSpecificationByIdLazyQuery();
    const [locations, setLocations] = useState<Array<Location>>([]);

    const { loading, data, error } = useLocationsByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
        skip: !selectedAgent,
        pollInterval: 5000  // Skip the query if selectedAgent is null
    });

    useEffect(() => {
        if (data?.locationsByAgent) {
            setLocations(data.locationsByAgent);
        }
    }, [data]);

    console.log(process)

    const renderSelectComponent = (df: RecipeFlowDataField, hideProduct?: boolean) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.Product && !hideProduct) {
            return (
                <Box key={df.id} className="fields">
                    <Heading size={"md"}>{`${df.field} ${required}`}</Heading>
                    <Text size={"sm"}>{df.note}</Text>
                    <Select style={{ maxWidth: "20em" }} key={df.id}
                        placeholder="Default Value">
                        {
                            resources.map(p => {
                                return <option key={p.id} value={p.id}>{p.name}</option>
                            })
                        }
                    </Select>
                </Box>
            )
        } else if (df.fieldClass === FieldClass.AtLocation) {
            return (
                <Box key={df.id} className="fields">
                    <Heading size={"md"}>{`${df.field} ${required}`}</Heading>
                    <Text size={"sm"}>{df.note}</Text>
                    {
                        locations ? (
                            <Select style={{ maxWidth: "20em" }} key={df.id}
                                placeholder="Default Value">
                                {
                                    locations.map(p => {
                                        return <option key={p.id} value={p.id}>{p.name}</option>
                                    })
                                }
                            </Select>
                        ) : <Alert status="warning">No Locations found for Agent</Alert>
                    }
                </Box>
            )
        }
        return null;
    }

    const renderDisabledInputComponent = (df: RecipeFlowDataField, hideProduct?: boolean) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.TrackingIdentifier) return null;
        if(df.fieldClass === FieldClass.Product && hideProduct) return null;
        if(!df.defaultValue) return null;

        let value = df.defaultValue;
        if(df.fieldClass === FieldClass.Product) {
            value = (resources.find(r => r.id === df.defaultValue) as ResourceSpecification).name;
        } else if(df.fieldClass === FieldClass.AtLocation && locations.length > 0) {
            value = (locations.find(l => l.id === df.defaultValue) as Location).name
        }
        return (
            <Box key={df.id} className="fields">
                <Heading size={"md"}>{`${df.field} ${required}`}</Heading>
                <Text size={"sm"}>{df.note}</Text>
                <Input
                    defaultValue={value}
                    placeholder="Default Value"
                    disabled
                    type={df.fieldType.toLowerCase()}>
                </Input>
            </Box>
        )
    }

    const renderInputComponent = (df: RecipeFlowDataField) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.TrackingIdentifier) return null;
        return (
            <Box key={df.id} className="fields">
                <Heading size={"md"}>{`${df.field} ${required}`}</Heading>
                <Text size={"sm"}>{df.note}</Text>
                <Input
                    placeholder="Default Value"
                    type={df.fieldType.toLowerCase()}>
                </Input>
            </Box>
        )
    }

    const renderFields = (df: Array<RecipeFlowDataField>, hideProduct?: boolean) => {
        return df.map((f) => {
            if(f.defaultValue) return renderDisabledInputComponent(f, hideProduct);
            if (f.fieldType === FieldType.Select) return renderSelectComponent(f, hideProduct)
            else if (f.fieldType === FieldType.Number) return renderInputComponent(f)
            else if (f.fieldType === FieldType.Date) return renderInputComponent(f)
            else if (f.fieldType === FieldType.Text) return renderInputComponent(f)
            return null
        })
    }

    const renderInputArguments = (inputFlows: Array<RecipeProcessFlowResponse>) => {
        return inputFlows.filter(rf => rf.roleType === RoleType.Input).map(rf => {
            
            return (
                <div key={rf.id} className="fields">
                    {renderFields(rf.dataFields)}
                </div>
            )
        })
    }

    const renderOutputArguments = (outputFlows: Array<RecipeProcessFlowResponse>) => {
        return outputFlows.filter(rf => rf.roleType === RoleType.Output).map(rf => {
            let hideProduct = false;
            if (rf.action === ActionType.Modify) hideProduct = true;
            return (
                <div key={rf.id} className="fields">
                    {renderFields(rf.dataFields, hideProduct)}
                </div>
            )
        })
    }

    const renderProcessFlows = (flows: Array<RecipeProcessFlowResponse>) => {
        return (
            <div>
                <div>
                {renderInputArguments(flows.filter(f => f.roleType === RoleType.Input))}
                </div>
                <div>
                {renderOutputArguments(flows.filter(f => f.roleType === RoleType.Output))}
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
                        <Button colorScheme="teal">Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    }
    return null;

}

export default ProcessModal