import { Button, Card, CardBody, Heading, Text } from "@chakra-ui/react"
import { useState } from "react"
import NewProcessComponent from "./new";
import { RecipeTemplateWithRecipeFlows, RecipeWithResources } from "../../apollo/__generated__/graphql";
import ViewProcessComponent from "./view_process";

interface Props {
    recipe: RecipeWithResources
}

export interface TemplateWithRelation {
    outputOf: RecipeTemplateWithRecipeFlows | null,
    template: RecipeTemplateWithRecipeFlows,
}

export const ProcessesInfo = ({recipe}: Props) => {

    const [openNewTemplateModal, setOpenNewTemplateModal] = useState(false);
    const [openShowTemplateModal, setOpenShowTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithRelation | null>(null)
    const [templates, setTemplates] = useState<Array<TemplateWithRelation>>([])

    const onAddTemplate = (template: RecipeTemplateWithRecipeFlows) => {
        const lastTemplate = templates[templates.length - 1];
        const templateRelation: TemplateWithRelation = {
            outputOf: lastTemplate?.template ? lastTemplate.template : null,
            template
        }
        setTemplates([...templates, templateRelation]);
    }

    const onShowTemplate = (template: TemplateWithRelation) => {
        setSelectedTemplate(template);
        setOpenShowTemplateModal(true);
    }

    const onEditedTemplate = (t: TemplateWithRelation) => {
        setOpenShowTemplateModal(false)
    }

    const renderTemplates = () => {
        return templates.map(r => {
            return (
                <Card onClick={() => onShowTemplate(r)} className="new_process_card" key={r.template.id}>
                    <Heading size='x' textTransform='uppercase'>
                        {r.template.name}
                    </Heading>
                    <CardBody>
                        <Text>{r.template.recipeTemplateType}</Text>
                    </CardBody>
                </Card>
            )
        })
    }

    return (
        <div style={{ textAlign: "center" }}>
            <ViewProcessComponent 
                recipe={recipe}
                isOpen={openShowTemplateModal} 
                template={selectedTemplate}
                onEditedTemplate={onEditedTemplate}
                onClose={() => setOpenShowTemplateModal(false)} />
            <NewProcessComponent
                isOpen={openNewTemplateModal}
                onAddTemplate={onAddTemplate}
                onClose={() => setOpenNewTemplateModal(false)} />
            <Button onClick={() => setOpenNewTemplateModal(true)} style={{ margin: "auto" }} as="a" colorScheme="teal" size="md">
                New
            </Button>

            <div style={{ marginTop: "3em", display: "flex" }}>
                {renderTemplates()}
            </div>
            {
                templates.length > 0 && (
                    <Button style={{ margin: "auto" }} as="a" colorScheme="teal" size="md">
                        Save
                    </Button>
                )
            }
        </div>
    )
}