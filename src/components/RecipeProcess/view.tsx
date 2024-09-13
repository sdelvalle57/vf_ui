import { Alert, Card, CardBody, Heading, Spinner, Text } from "@chakra-ui/react";
import { RecipeProcessResponse, ResourceSpecification, useGetRecipeProcessesQuery } from "../../apollo/__generated__/graphql";
import { useState } from "react";
import ProcessModal from "./process_modal";

interface Props {
    recipeId: string
}


const ViewProcesses = ({ recipeId }: Props) => {

    const [openShowProcessModal, setOpenShowProcessModal] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<RecipeProcessResponse | null>(null)

    const { loading, data, error } = useGetRecipeProcessesQuery({
        variables: {
            recipeId
        },
        pollInterval: 5000
    })

    const onShowProcess = (p: RecipeProcessResponse) => {
        setSelectedProcess(p);
        setOpenShowProcessModal(true);
    }

    const renderProcesses = (r: Array<RecipeProcessResponse>) => {
        return r.map(p => {
            return (
                <Card onClick={() => onShowProcess(p)} key={p.id} className="new_process_card">
                    <Heading size='x' textTransform='uppercase'>
                        {p.name}
                    </Heading>
                    <CardBody>
                        <Text>{p.recipeType}</Text>
                    </CardBody>
                </Card>
            )
        })

    }

    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if (!data) return null;

    const processes: Array<RecipeProcessResponse> = data.getRecipeProcesses.recipeProcesses as Array<RecipeProcessResponse>;

    return (
        <>
            <ProcessModal 
                process={selectedProcess}
                recipe={data.getRecipeProcesses.recipe}
                resources={data.getRecipeProcesses.resources as Array<ResourceSpecification>}
                isOpen={openShowProcessModal} 
                onClose={() => setOpenShowProcessModal(false)} />
            <div style={{ marginTop: "3em", display: "flex" }}>
                {renderProcesses(processes)}
            </div>
        </>
    )
}

export default ViewProcesses;