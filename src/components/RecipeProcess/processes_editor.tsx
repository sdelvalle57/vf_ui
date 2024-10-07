import { Button, Card, CardBody, Grid, GridItem, Heading, Text, useToast } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import TemplatesComponent from "./templates";
import { RecipeProcessWithRelation, RecipeTemplateWithRecipeFlows, RecipeWithResources } from "../../apollo/__generated__/graphql";
import EditProcessComponent from "./edit_process";

interface Props {
    recipe: RecipeWithResources
}

export const RecipeProcessEditor = ({ recipe }: Props) => {
    const toast = useToast();

    const [openShowProcessModal, setOpenShowProcessModal] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<RecipeProcessWithRelation | null>(null)
    const [processes, setProcesses] = useState<Array<RecipeProcessWithRelation>>([])

    console.log(recipe)
    console.log(processes)


    // const [createRecipeProcesses, { loading, error }] = useCreateRecipeProcessesMutation({
    //     onCompleted: async (data) => {
    //         toast({
    //             title: "Economic Resource created.",
    //             description: `Recipe data ${data.createRecipeProcesses.recipe.name} was successfully created.`,
    //             status: "success",
    //             duration: 5000,
    //             isClosable: true,
    //         });
    //     },
    // });

    // useEffect(() => {
    //     if (error) {
    //         toast({
    //             title: "Error assigning template",
    //             description: error.message,
    //             status: "error",
    //             duration: 5000,
    //             isClosable: true,
    //         });
    //     }
    // }, [error])

    console.log(processes)

    const onAddProcess = (template: RecipeTemplateWithRecipeFlows) => {
        console.log(template)
        const lastTemplate = processes[processes.length - 1];
        const recipeProcessRelation: RecipeProcessWithRelation = {
            outputOf: lastTemplate?.recipeProcess ? [lastTemplate.recipeProcess] : [],
            recipeProcess: template
        }
        setProcesses([...processes, recipeProcessRelation]);
    }

    const onShowTemplate = (template: RecipeProcessWithRelation) => {
        setSelectedProcess(template);
        setOpenShowProcessModal(true);
    }

    const onEditedProcess = (p: RecipeProcessWithRelation) => {
        const tIndex = processes.findIndex(i => i.recipeProcess.id === p.recipeProcess.id);
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
        // try {
        //     await createRecipeProcesses({
        //         variables: {
        //             recipeId: recipe.recipe.id,
        //             data: removeTypename(processes)
        //         },
        //     });
        // } catch (err: any) {
        //     toast({
        //         title: "An error occurred.",
        //         description: err.message,
        //         status: "error",
        //         duration: 5000,
        //         isClosable: true,
        //     });
        // }
    };


    const renderProcesses = () => {
        return processes.map((r, i) => {
            return (
                <Card onClick={() => onShowTemplate(r)} className="new_process_card" key={r.recipeProcess.id + i}>
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
        <div style={{ textAlign: "center", minHeight: "80vh" }}>
            <Grid
                h='200px'
                templateRows='repeat(2, 1fr)'
                templateColumns='repeat(10, 1fr)'
                gap={4} >
                <GridItem colSpan={3}>
                    <EditProcessComponent
                        recipe={recipe}
                        isOpen={openShowProcessModal}
                        process={selectedProcess}
                        onEditedProcess={onEditedProcess}
                        onClose={() => setOpenShowProcessModal(false)} />
                    <TemplatesComponent
                        onAddProcess={onAddProcess}/>

                </GridItem>

                <GridItem colSpan={6}>
                    {renderProcesses()}
                </GridItem>

                <GridItem colSpan={9}>
                    {
                        processes.length > 0 && (
                            <Button onClick={onSave} style={{ margin: "auto" }} as="a" colorScheme="teal" size="md">
                                Save
                            </Button>
                        )
                    }
                </GridItem>
            </Grid>

        </div>
    )
}