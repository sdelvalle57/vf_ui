import { Button, Card, CardBody, Heading, Text } from "@chakra-ui/react"
import { useState } from "react"
import NewProcessComponent from "./new";
import { RecipeProcessWithRelation, RecipeTemplateWithRecipeFlows, RecipeWithResources } from "../../apollo/__generated__/graphql";
import EditProcessComponent from "./edit_process";

interface Props {
    recipe: RecipeWithResources
}

export const RecipeProcessEditor = ({recipe}: Props) => {

    const [openNewProcessModal, setOpenNewTemplateModal] = useState(false);
    const [openShowProcessModal, setOpenShowProcessModal] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<RecipeProcessWithRelation | null>(null)
    const [processes, setProcesses] = useState<Array<RecipeProcessWithRelation>>([])

    const onAddProcess = (template: RecipeTemplateWithRecipeFlows) => {
        const lastTemplate = processes[processes.length - 1];
        const recipeProcessRelation: RecipeProcessWithRelation = {
            outputOf: lastTemplate?.recipeProcess ? lastTemplate.recipeProcess : null,
            recipeProcess: template,
            defaultValues: []
        }
        setProcesses([...processes, recipeProcessRelation]);
    }

    const onShowTemplate = (template: RecipeProcessWithRelation) => {
        setSelectedProcess(template);
        setOpenShowProcessModal(true);
    }

    const onEditedProcess = (p: RecipeProcessWithRelation) => {
        const tIndex = processes.findIndex(i => i.recipeProcess.id === i.recipeProcess.id);
        const processesCopy: Array<RecipeProcessWithRelation> = Object.assign([], processes);
        processesCopy[tIndex] = p;
        setProcesses(processesCopy);
        setOpenShowProcessModal(false)
    }

    console.log(processes)

    const renderTemplates = () => {
        return processes.map(r => {
            return (
                <Card onClick={() => onShowTemplate(r)} className="new_process_card" key={r.recipeProcess.id}>
                    <Heading size='x' textTransform='uppercase'>
                        {r.recipeProcess.name}
                    </Heading>
                    <CardBody>
                        <Text>{r.recipeProcess.recipeTemplateType}</Text>
                    </CardBody>
                </Card>
            )
        })
    }

    return (
        <div style={{ textAlign: "center" }}>
            <EditProcessComponent 
                recipe={recipe}
                isOpen={openShowProcessModal} 
                process={selectedProcess}
                onEditedProcess={onEditedProcess}
                onClose={() => setOpenShowProcessModal(false)} />
            <NewProcessComponent
                isOpen={openNewProcessModal}
                onAddProcess={onAddProcess}
                onClose={() => setOpenNewTemplateModal(false)} />
            <Button onClick={() => setOpenNewTemplateModal(true)} style={{ margin: "auto" }} as="a" colorScheme="teal" size="md">
                New
            </Button>

            <div style={{ marginTop: "3em", display: "flex" }}>
                {renderTemplates()}
            </div>
            {
                processes.length > 0 && (
                    <Button style={{ margin: "auto" }} as="a" colorScheme="teal" size="md">
                        Save
                    </Button>
                )
            }
        </div>
    )
}