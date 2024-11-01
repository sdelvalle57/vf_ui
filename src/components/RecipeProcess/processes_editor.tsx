import { Box, Button, Card, CardBody, Flex, Grid, GridItem, Heading, Text, useToast } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import TemplatesComponent from "./templates";
import { RecipeProcessRelation, RecipeTemplateWithRecipeFlows, RecipeWithResources, useSetRecipeProcessesMutation } from "../../apollo/__generated__/graphql";
import EditProcessComponent from "./edit_process";
import 'reactflow/dist/style.css';
import ReactFlow, { addEdge, applyEdgeChanges, applyNodeChanges, Background, Connection, Controls, Edge, EdgeChange, Handle, Node, NodeChange, Position, ReactFlowProvider, EdgeProps, BaseEdge, EdgeLabelRenderer } from "reactflow";

interface Props {
    recipe: RecipeWithResources;
}

export const RecipeProcessEditor = ({ recipe }: Props) => {
    const toast = useToast();

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
    }, [error]);

    const onAddProcess = (template: RecipeTemplateWithRecipeFlows) => {
        const newNode: Node = {
            id: `${nodes.length + 1}`, // Assign a unique ID
            type: 'customNode', // Use the customNode type defined below
            position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random initial position, you can adjust this
            data: {
                label: template.name, // Example label, can customize to use template data
                templateId: template.id,
                onNodeDelete: () => {
                    // Define node delete logic if required
                    setNodes((nds) => nds.filter((node) => node.id !== newNode.id));
                    setEdges((eds) => eds.filter((edge) => edge.source !== newNode.id && edge.target !== newNode.id));
                },
            },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const onEdgesChange = (changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    };

    const onConnect = (connection: Connection) => {
        if (connection.source && connection.target) {
            const newEdge: Edge = {
                ...connection,
                id: `e${connection.source}-${connection.target}`,
                type: 'custom', // Use custom edge type
                data: {
                    onEdgeDelete: () => {
                        setEdges((eds) => eds.filter((edge) => edge.id !== `e${connection.source}-${connection.target}`));
                    },
                },
                source: connection.source,
                target: connection.target,
                sourceHandle: connection.sourceHandle || undefined,
                targetHandle: connection.targetHandle || undefined,
            };
            setEdges((eds) => [...eds, newEdge]);
        }
    };

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
    };

    const onNodesChange = (changes: NodeChange[]) => {
        setNodes((nds) => {
            return applyNodeChanges(changes, nds);
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
                            edgeTypes={{ custom: CustomEdge }}
                            nodesConnectable={true}
                            nodesDraggable={true}
                            selectNodesOnDrag={true}
                            fitView
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}  >
                            <Background />
                            <Controls />
                        </ReactFlow>
                    </Box>
                </Flex>
            </Flex>
        </ReactFlowProvider>
    );
};

const CustomNode = ({ id, data }: any) => {
    const { onNodeDelete, templateId } = data;

    return (
        <Box position="relative" padding="1em" border="1px solid #ccc" borderRadius="8px" bg="white" shadow="md" maxWidth="200px">
            <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{data.label}</div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </Box>
    );
};

const nodeTypes = { customNode: CustomNode };

// Custom Edge Component
const CustomEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, style, data }: EdgeProps) => {
    const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
    const markerEnd = 'url(#arrowhead)';
    const labelX = (sourceX + targetX) / 2;
    const labelY = (sourceY + targetY) / 2;

    const onEdgeClick = () => {
        if (data?.onEdgeDelete) {
            data.onEdgeDelete();
        }
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <button className="edgebutton" onClick={onEdgeClick}>
                        ×
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};