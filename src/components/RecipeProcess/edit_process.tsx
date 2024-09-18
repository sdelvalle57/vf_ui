import { useEffect, useState } from "react";
import { ActionType, FieldClass, FieldType, Location, RecipeFlowDataFieldInput, RecipeFlowTemplateDataFieldInput, RecipeFlowWithDataFields, RecipeProcessWithRelation, RecipeWithRecipeFlows, RecipeWithResources, RoleType, useLocationsByAgentQuery } from "../../apollo/__generated__/graphql";
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

    console.log(process)


    const handleChange = (
        rf: RecipeFlowWithDataFields,
        data_field: RecipeFlowDataFieldInput,
        defaultValue: string
    ) => {
        console.log(defaultValue)
        if (editedProcess) {
            // Update the data fields of the recipe flow
            const updatedDataFields = rf.dataFields.map((df) => {
                if (df.id === data_field.id) {
                    // Return a new object with the updated defaultValue
                    return {
                        ...df,
                        defaultValue: defaultValue, // Update the defaultValue
                    };
                }
                return df; // Keep the other fields unchanged
            });

            // Create a new object for rf with the updated data fields
            const updatedRecipeFlow: RecipeFlowWithDataFields = {
                ...rf,
                dataFields: updatedDataFields,
            };

            // Update the recipe flows in the recipe process
            const updatedRecipeFlows = editedProcess.recipeProcess.recipeFlows.map(
                (flow) => {
                    if (flow.id === updatedRecipeFlow.id) {
                        // Replace the old flow with the updated flow
                        return updatedRecipeFlow;
                    }
                    return flow; // Keep the other flows unchanged
                }
            );

            // Create a new recipeProcess object with the updated recipeFlows
            const updatedRecipeProcess: RecipeWithRecipeFlows = {
                ...editedProcess.recipeProcess,
                recipeFlows: updatedRecipeFlows,
            };

            // Create a new editedProcess object and update the state
            const updatedProcess: RecipeProcessWithRelation = {
                ...editedProcess,
                recipeProcess: updatedRecipeProcess,
            };

            // Update the state to trigger a re-render
            setEditedProcess(updatedProcess);
        }
    };


    const onSave = (t: RecipeProcessWithRelation) => {
        onEditedProcess(t)
    }

    const renderSelectComponent = (f: RecipeFlowDataFieldInput, rf: RecipeFlowWithDataFields, hideProduct?: boolean) => {
        const required = f.required ? "*" : ""
        if (f.fieldClass === FieldClass.Product && !hideProduct) {
            const recipeProducts = recipe.resourceSpecifications;
            return (
                <Box key={f.id} className="fields">
                    <Heading size={"md"}>{`${f.field} ${required}`}</Heading>
                    <Text size={"sm"}>{f.note}</Text>
                    <Select 
                        onChange={({ target }) => handleChange(rf, f, target.value)} 
                        style={{ maxWidth: "20em" }} 
                        key={f.id}
                        defaultValue={f.defaultValue || ""}
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
                            <Select 
                                onChange={({ target }) => handleChange(rf, f, target.value)} 
                                style={{ maxWidth: "20em" }} 
                                key={f.id}
                                defaultValue={f.defaultValue || ""}
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

    const renderInputComponent = (f: RecipeFlowDataFieldInput, rf: RecipeFlowWithDataFields) => {
        const required = f.required ? "*" : "";
        if (f.fieldClass === FieldClass.TrackingIdentifier) return null;
        return (
            <Box key={f.id} className="fields">
                <Heading size={"md"}>{`${f.field} ${required}`}</Heading>
                <Text size={"sm"}>{f.note}</Text>
                <Input
                    onChange={({ target }) => handleChange(rf, f, target.value)}
                    placeholder="Default Value"
                    defaultValue={f.defaultValue || ""}
                    type={f.fieldType.toLowerCase()}>
                </Input>
            </Box>
        )
    }

    const renderFields = (rf: RecipeFlowWithDataFields, hideProduct?: boolean) => {
        return rf.dataFields.map((f) => {
            if (f.fieldType === FieldType.Select) return renderSelectComponent(f, rf, hideProduct)
            else if (f.fieldType === FieldType.Number) return renderInputComponent(f, rf)
            else if (f.fieldType === FieldType.Date) return renderInputComponent(f, rf)
            else if (f.fieldType === FieldType.Text) return renderInputComponent(f, rf)
            return null
        })
    }


    const renderInputArguments = (t: RecipeProcessWithRelation) => {
        return t.recipeProcess.recipeFlows.filter(rf => rf.roleType === RoleType.Input).map(rf => {
            return (
                <div key={rf.id}>
                    {renderFields(rf)}
                </div>
            )
        })
    }

    const renderOutputArguments = (t: RecipeProcessWithRelation) => {
        return t.recipeProcess.recipeFlows.filter(rf => rf.roleType === RoleType.Output).map(rf => {
            if(rf.inherits) return null
            let hideProduct = false;
            if (rf.action === ActionType.Modify) hideProduct = true;
            return (
                <div key={rf.id}>
                    {renderFields(rf, hideProduct)}
                </div>
            )
        })
    }

    const renderFlowsInfo = (t: RecipeProcessWithRelation) => {
        const renderOutputs = t.recipeProcess.recipeFlows.filter(rf => rf.roleType === RoleType.Output).filter(rf => !rf.inherits).length;
        const renderInputs = t.recipeProcess.recipeFlows.filter(rf => rf.roleType === RoleType.Input).length;
        return (
            <Tabs>
                <TabList>
                    {renderInputs > 0 && <Tab>Inputs</Tab>}
                    {renderOutputs > 0 && <Tab>Outputs</Tab>}
                </TabList>

                <TabPanels>
                    {renderInputs > 0 && <TabPanel>{renderInputArguments(t)}</TabPanel>}
                    {renderOutputs > 0 && <TabPanel>{renderOutputArguments(t)}</TabPanel>}
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