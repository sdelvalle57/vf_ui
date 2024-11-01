import { Box, Button, Flex, IconButton, useToast } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import TemplatesComponent from "./templates";
import { RecipeTemplateWithRecipeFlows, RecipeWithResources, useSetRecipeProcessesMutation } from "../../apollo/__generated__/graphql";
import 'reactflow/dist/style.css';
import ReactFlow, { applyEdgeChanges, applyNodeChanges, Background, Connection, Controls, Edge, EdgeChange, Handle, Node, NodeChange, Position, ReactFlowProvider, EdgeProps, BaseEdge, EdgeLabelRenderer, Panel } from "reactflow";
import { CloseIcon } from "@chakra-ui/icons";

interface Props {
    recipe: RecipeWithResources;
}

interface Predecessor {
    template: RecipeTemplateWithRecipeFlows,
    nodeId: string
}

interface ProcessRelation {
    nodeId: string,
    template: RecipeTemplateWithRecipeFlows;
    predecessors: Array<Predecessor>;
}

export const RecipeProcessEditor = ({ recipe }: Props) => {
    const toast = useToast();

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [processRelations, setProcessRelations] = useState<ProcessRelation[]>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
                template,
                onNodeDelete: () => {
                    setNodes((nds) => nds.filter((node) => node.id !== newNode.id));
                    setEdges((eds) => eds.filter((edge) => edge.source !== newNode.id && edge.target !== newNode.id));
                },
            },
        };
        setNodes((nds) => [...nds, newNode]);
        if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2 });
        }
    };

    const onEdgesChange = (changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    };

    const onConnect = (connection: Connection) => {
        if (connection.source && connection.target) {
            // Check blacklists before creating a new edge
            const sourceNode = nodes.find((node) => node.id === connection.source);
            const targetNode = nodes.find((node) => node.id === connection.target);

            if (sourceNode && targetNode) {
                const sourceTemplate = sourceNode.data.template as RecipeTemplateWithRecipeFlows;
                const targetTemplate = targetNode.data.template as RecipeTemplateWithRecipeFlows;

                const isBlacklisted = sourceTemplate.blacklists.some(
                    (blacklist) =>
                        blacklist.recipeTemplateId === targetTemplate.id &&
                        blacklist.recipeTemplatePredecesorId === sourceTemplate.id
                );

                if (isBlacklisted) {
                    toast({
                        title: "Connection not allowed",
                        description: `Cannot connect ${sourceTemplate.name} to ${targetTemplate.name} due to blacklist restrictions`,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }
            }

            const newEdge: Edge = {
                ...connection,
                id: `e${connection.source}-${connection.target}`,
                type: 'custom', // Use custom edge type
                data: {
                    onEdgeDelete: () => {
                        setEdges((eds) => eds.filter((edge) => edge.id !== `e${connection.source}-${connection.target}`));
                        // Remove predecessor relation
                        setProcessRelations((relations) => {
                            return relations.map((relation) => {
                                return {
                                    ...relation,
                                    predecessors: relation.predecessors.filter(
                                        (predecessor) => predecessor.nodeId !== connection.source
                                    ),
                                };
                            });
                        });
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
        const templates = nodes.map(n => n.data.template.id)
        console.log("templates", templates)
        // TODO: save the processRelations state
        console.log('Saving process relations:', JSON.stringify(processRelations.map(p => {
            return {
                t: p.template.name,
                p: p.predecessors.map(d => {
                    return {
                        t: d.template.name,
                        id: d.nodeId,
                    }
                }),
                id: p.nodeId
            }
        })));
    };

    const logProcessRelations = () => {
        const updatedProcessRelations: Array<ProcessRelation> = nodes.map((node) => {
            const { template } = node.data;

            const predecessors = edges
                .filter((edge) => edge.target === node.id)
                .map((edge) => {
                    const sourceNode = nodes.find((n) => n.id === edge.source);
                    if (sourceNode) {
                        console.log("sourceNode", sourceNode);
                        const predecessorTemplate = sourceNode.data.template;
                        return {
                            template: predecessorTemplate,
                            nodeId: sourceNode.id
                        };
                    }
                    return null;
                })
                .filter((predecessor): predecessor is Predecessor => predecessor !== null);

            return {
                nodeId: node.id,
                template,
                predecessors,
            };
        });

        setProcessRelations(updatedProcessRelations);
        console.log(updatedProcessRelations);
    };

    useEffect(() => {
        logProcessRelations();
    }, [nodes, edges]);

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
                            onInit={(instance) => setReactFlowInstance(instance)}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}  >
                            <Background />
                            <Controls />
                        </ReactFlow>
                        <Panel position='bottom-center'>
                            {
                                <Button onClick={onSave} colorScheme='blue'>Save</Button>
                            }
                        </Panel>
                    </Box>
                </Flex>
            </Flex>
        </ReactFlowProvider>
    );
};

const CustomNode = ({ id, data }: any) => {
    const { onNodeDelete, template }: { onNodeDelete: any, template: RecipeTemplateWithRecipeFlows } = data;

    return (
        <Box position="relative" padding="10px 20px" border="1px solid #ccc" borderRadius="5px" bg="white" color="black" maxWidth="200px">
            <Box position="absolute" top="-10px" right="-10px">
                <IconButton
                    icon={<CloseIcon />}
                    size="xs"
                    colorScheme="red"
                    onClick={onNodeDelete}
                    aria-label="Delete Node"
                />
            </Box>
            <Handle type="target" position={Position.Top} style={{ background: '#555', width: '8px', height: '10px', borderRadius: '3px' }} />
            <div>
                <strong>{template.name}</strong>
            </div>
            <Handle type="source" position={Position.Bottom} style={{ background: '#555', width: '8px', height: '10px', borderRadius: '3px' }} />
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