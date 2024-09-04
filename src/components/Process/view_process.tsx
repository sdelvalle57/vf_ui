import { useEffect, useState } from "react";
import { ActionType, FieldType, FieldValue, RecipeFlowTemplateDataFieldInput, RecipeFlowTemplateWithDataFields, RecipeWithResources, RoleType } from "../../apollo/__generated__/graphql";
import { Box, Button, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text } from "@chakra-ui/react";
import { TemplateWithRelation } from "./processes_info";


interface Props {
    isOpen: boolean,
    onClose: () => void,
    template: TemplateWithRelation | null,
    recipe: RecipeWithResources,
    onEditedTemplate: (t: TemplateWithRelation) => void
}

const ViewProcessComponent = ({ isOpen, onClose, template, recipe, onEditedTemplate }: Props) => {

    const [editedTemplate, setEditedTemplate] = useState<TemplateWithRelation | null>(template)

    useEffect(() => {
        if (template && !editedTemplate) setEditedTemplate(template)
    }, [template])

    const renderSelectComponent = (f: RecipeFlowTemplateDataFieldInput) => {
        const required = f.required ? "*" : ""
        if (f.fieldValue === FieldValue.Product) {
            const recipeProducts = recipe.resourceSpecifications;
            return (
                <Box className="fields">
                    <Heading size={"md"}>{`${f.field} ${required}`}</Heading>
                    <Text size={"sm"}>{f.note}</Text>
                    <Select style={{ maxWidth: "20em" }} key={f.id}
                        placeholder="Default Value">
                        {
                            recipeProducts.map(p => {
                                return <option key={p.id} value={p.id}>{p.name}</option>
                            })
                        }
                    </Select>
                </Box>
            )
        }
        return null;
    }

    const renderInputNumberComponent = (f: RecipeFlowTemplateDataFieldInput) => {
        const required = f.required ? "*" : "";
        return (
            <Box className="fields">
                <Heading size={"md"}>{`${f.field} ${required}`}</Heading>
                <Text size={"sm"}>{f.note}</Text>
                <Input placeholder="Default Value" type="number"></Input>
            </Box>
        )
    }

    const renderInputTextComponent = (f: RecipeFlowTemplateDataFieldInput) => {
        const required = f.required ? "*" : "";
        return (
            <Box className="fields">
                <Heading size={"md"}>{`${f.field} ${required}`}</Heading>
                <Text size={"sm"}>{f.note}</Text>
                <Input placeholder="Default Value" type="text"></Input>
            </Box>
        )
    }

    const renderFields = (df: Array<RecipeFlowTemplateDataFieldInput>) => {
        return df.map((f) => {
            if (f.fieldType === FieldType.Select) return renderSelectComponent(f)
            else if (f.fieldType === FieldType.Number) return renderInputNumberComponent(f)
            else if(f.fieldType === FieldType.Text) return renderInputTextComponent(f)
            return null
        })
    }

    const renderFlowInfo = (f: RecipeFlowTemplateWithDataFields) => {
        if (f.roleType === RoleType.Output) {
            return (
                <div key={f.id}>
                    <Text><strong>{`Output Arguments`}</strong></Text>
                    {renderFields(f.dataFields)}
                </div>
            )
        }
        return null;
    }

    const renderFlows = (t: TemplateWithRelation) => {
        return t.template.recipeFlows.map(r => {
            return renderFlowInfo(r)
        })
    }

    if (editedTemplate) {
        return (
            <Modal id="view_process_modal" onClose={onClose} size={"xl"} isOpen={isOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{`${editedTemplate.template.name}(${editedTemplate.template.recipeTemplateType})`}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {renderFlows(editedTemplate)}
                    </ModalBody>
                    <ModalFooter>
                        <Button marginRight={"15px"} onClick={onClose}>Close</Button>
                        <Button colorScheme="teal" onClick={() => onEditedTemplate(editedTemplate)}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    }
    return null
}

export default ViewProcessComponent;