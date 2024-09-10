import { useEffect, useState } from "react";
import { ActionType, DefaultValue, FieldClass, FieldType, Location, RecipeFlowDataFieldInput, RecipeFlowTemplateDataFieldInput, RecipeProcessWithRelation, RecipeWithResources, RoleType, useLocationsByAgentQuery } from "../../apollo/__generated__/graphql";
import { Alert, Box, Button, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";


interface Props {
    isOpen: boolean,
    onClose: () => void,
    process: RecipeProcessWithRelation | null,
    recipe: RecipeWithResources,
    onEditedProcess: (t: RecipeProcessWithRelation) => void
}


const EditProcessComponent = ({ isOpen, onClose, process, recipe, onEditedProcess }: Props) => {
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);

    const [editedProcess, setEditedProcess] = useState<RecipeProcessWithRelation | null>(process)
    const [locations, setLocations] = useState<Array<Location>>([]);
    const [defaultValues, setDefaultValues] = useState<Array<DefaultValue>>([])

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


    useEffect(() => {
        if (process) setEditedProcess(process)
    }, [process])

    const handleChange = (fieldId: string, defaultValue: string) => {
        setDefaultValues((defValues) => {
            const newDefValues = defValues.filter(d => d.fieldId !== fieldId);
            newDefValues.push({
                fieldId,
                value: defaultValue
            })
            return newDefValues
        })
    }

    const onSave = (t: RecipeProcessWithRelation) => {
        t.defaultValues = defaultValues;
        onEditedProcess(t)
    }

    const renderSelectComponent = (f: RecipeFlowDataFieldInput, hideProduct?: boolean) => {
        const required = f.required ? "*" : ""
        if (f.fieldClass === FieldClass.Product && !hideProduct) {
            const recipeProducts = recipe.resourceSpecifications;
            return (
                <Box key={f.id} className="fields">
                    <Heading size={"md"}>{`${f.field} ${required}`}</Heading>
                    <Text size={"sm"}>{f.note}</Text>
                    <Select onChange={({ target }) => handleChange(f.id, target.value)} style={{ maxWidth: "20em" }} key={f.id}
                        placeholder="Default Value">
                        {
                            recipeProducts.map(p => {
                                return <option key={p.id} value={p.id}>{p.name}</option>
                            })
                        }
                    </Select>
                </Box>
            )
        } else if (f.fieldClass === FieldClass.AtLocation) {
            return (
                <Box key={f.id} className="fields">
                    <Heading size={"md"}>{`${f.field} ${required}`}</Heading>
                    <Text size={"sm"}>{f.note}</Text>
                    {
                        locations ? (
                            <Select onChange={({ target }) => handleChange(f.id, target.value)} style={{ maxWidth: "20em" }} key={f.id}
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

    const renderInputComponent = (f: RecipeFlowDataFieldInput) => {
        const required = f.required ? "*" : "";
        if(f.fieldClass === FieldClass.TrackingIdentifier) return null;
        return (
            <Box key={f.id} className="fields">
                <Heading size={"md"}>{`${f.field} ${required}`}</Heading>
                <Text size={"sm"}>{f.note}</Text>
                <Input
                    onChange={({ target }) => handleChange(f.id, target.value)}
                    placeholder="Default Value"
                    type={f.fieldType.toLowerCase()}>
                </Input>
            </Box>
        )
    }

    const renderFields = (df: Array<RecipeFlowDataFieldInput>, hideProduct?: boolean) => {
        return df.map((f) => {
            if (f.fieldType === FieldType.Select) return renderSelectComponent(f, hideProduct)
            else if (f.fieldType === FieldType.Number) return renderInputComponent(f)
            else if (f.fieldType === FieldType.Date) return renderInputComponent(f)
            else if (f.fieldType === FieldType.Text) return renderInputComponent(f)
            return null
        })
    }


    const renderInputArguments = (t: RecipeProcessWithRelation) => {
        return t.recipeProcess.recipeFlows.filter(rf => rf.roleType === RoleType.Input).map(rf => {
            return (
                <div key={rf.id}>
                    {renderFields(rf.dataFields)}
                </div>
            )
        })
    }

    const renderOutputArguments = (t: RecipeProcessWithRelation) => {
        return t.recipeProcess.recipeFlows.filter(rf => rf.roleType === RoleType.Output).map(rf => {

            let hideProduct = false;
            if (rf.action === ActionType.Modify) hideProduct = true;
            return (
                <div key={rf.id}>
                    {renderFields(rf.dataFields, hideProduct)}
                </div>
            )
        })
    }

    const renderFlowsInfo = (t: RecipeProcessWithRelation) => {
        return (
            <Tabs>
                <TabList>
                    <Tab>Inputs</Tab>
                    <Tab>Outputs</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>{renderInputArguments(t)} </TabPanel>
                    <TabPanel>{renderOutputArguments(t)}</TabPanel>
                </TabPanels>
            </Tabs>
        )
    }

    if (editedProcess) {
        return (
            <Modal closeOnOverlayClick={false} id="view_process_modal" onClose={onClose} size={"xl"} isOpen={isOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{`${editedProcess.recipeProcess.name}(${editedProcess.recipeProcess.recipeTemplateType})`}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {renderFlowsInfo(editedProcess)}
                    </ModalBody>
                    <ModalFooter>
                        <Button marginRight={"15px"} onClick={onClose}>Close</Button>
                        <Button colorScheme="teal" onClick={() => onSave(editedProcess)}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    }
    return null
}

export default EditProcessComponent;