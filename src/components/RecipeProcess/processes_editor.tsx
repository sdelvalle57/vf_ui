import { Box, Button, Card, CardBody, Flex, Grid, GridItem, Heading, Text, useToast } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import TemplatesComponent from "./templates";
import { RecipeProcessRelation, RecipeTemplateWithRecipeFlows, RecipeWithResources, useSetRecipeProcessesMutation } from "../../apollo/__generated__/graphql";
import EditProcessComponent from "./edit_process";
import 'reactflow/dist/style.css';
import ReactFlow, { applyNodeChanges, Background, Controls, Edge, Handle, Node, NodeChange, Position, ReactFlowProvider } from "reactflow";

interface Props {
    recipe: RecipeWithResources
}

export const RecipeProcessEditor = ({ recipe }: Props) => {
    const toast = useToast();

    const [processes, setProcesses] = useState<Array<RecipeProcessRelation>>([])
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);


    const [setRecipeProcesses, { loading, error }] = useSetRecipeProcessesMutation({
        onCompleted: async (data) => {
            toast({
                title: "Economic Resource created.",
                description: `${recipe.recipe.name} data was successfully created.`,
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
        const recipeProcessRelation: RecipeProcessRelation = {
            templateId: template.id,
            templatePredecessorId: lastTemplate?.templateId ? [lastTemplate.templateId] : [],
        }
        setProcesses([...processes, recipeProcessRelation]);
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

    const onNodesChange = (changes: NodeChange[]) => {
        setNodes((nds) => {
            return applyNodeChanges(changes, nds)
        });
    };

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        //TODO: save
    };

    return (
        <ReactFlowProvider>
            <Flex direction="column" height="50vh">
                {/* Sidebar with RecipeTemplates */}
                <Flex direction="row" flexGrow={1}>
                    <TemplatesComponent onAddTemplate={onAddProcess} />
                    {/* React Flow Canvas */}
                    <Box width="80%" padding="2em">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            nodesConnectable={true}
                            nodesDraggable={true}
                            selectNodesOnDrag={true}
                            fitView
                            onNodesChange={onNodesChange}  >
                            <Background />
                            <Controls />
                        </ReactFlow>
                    </Box>
                </Flex>
            </Flex>
        </ReactFlowProvider>
    )
}


const CustomNode = ({ id, data }: any) => {
    const { onNodeDelete, role, templateId } = data;

    const handleDelete = () => {
        onNodeDelete(role, templateId)
    };

    return (
        <Box position="relative" padding="1em" border="1px solid #ccc" borderRadius="8px" bg="white" shadow="md" maxWidth="200px">

            <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{data.label}</div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </Box>
    );
};

const nodeTypes = { customNode: CustomNode };
