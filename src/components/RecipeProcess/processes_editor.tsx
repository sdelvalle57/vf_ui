import { Button, Card, CardBody, Heading, Text, useToast } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import NewProcessComponent from "./new";
import { RecipeProcessWithRelation, RecipeTemplateWithRecipeFlows, RecipeWithRecipeFlows, RecipeWithResources, useCreateRecipeProcessesMutation } from "../../apollo/__generated__/graphql";
import EditProcessComponent from "./edit_process";

interface Props {
    recipe: RecipeWithResources
}

export const RecipeProcessEditor = ({ recipe }: Props) => {
    const toast = useToast();

    const [openNewProcessModal, setOpenNewTemplateModal] = useState(false);
    const [openShowProcessModal, setOpenShowProcessModal] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<RecipeProcessWithRelation | null>(null)
    const [processes, setProcesses] = useState<Array<RecipeProcessWithRelation>>([])


    const [createRecipeProcesses, { loading, error }] = useCreateRecipeProcessesMutation({
        onCompleted: async (data) => {
            console.log(data)
            toast({
                title: "Economic Resource created.",
                description: `Recipe data ${data.createRecipeProcesses.recipe.name} was successfully created.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    useEffect(() => {
        if (error) {
            toast({
                title: "Error assigning template",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [error])

    const onAddProcess = (template: RecipeTemplateWithRecipeFlows) => {
        const lastTemplate = processes[processes.length - 1];
        const recipeProcessRelation: RecipeProcessWithRelation = {
            outputOf: lastTemplate?.recipeProcess ? lastTemplate.recipeProcess : null,
            recipeProcess: template
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

    const removeTypename = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map((item) => removeTypename(item));
        } else if (obj !== null && typeof obj === 'object') {
          const newObj: any = {};
          for (let key in obj) {
            if (key !== '__typename') {
              newObj[key] = removeTypename(obj[key]);
            }
          }
          return newObj;
        }
        return obj;
      }

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRecipeProcesses({
                variables: {
                    recipeId: recipe.recipe.id,
                    data: removeTypename(processes)
                },
            });
        } catch (err: any) {
            toast({
                title: "An error occurred.",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };


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
                    <Button onClick={onSave} style={{ margin: "auto" }} as="a" colorScheme="teal" size="md">
                        Save
                    </Button>
                )
            }
        </div>
    )
}