import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, Handle, Position, applyNodeChanges, NodeChange, useReactFlow, Panel, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Flex, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { MapTemplateResponse, RecipeTemplateBlacklist, RecipeTemplateWithRecipeFlows, RoleType } from '../apollo/__generated__/graphql';
import { CloseIcon, AddIcon, CheckCircleIcon } from '@chakra-ui/icons';



enum NodeType {
    INPUT,
    OUTPUT
}

const CustomNode = ({ id, data }: any) => {
    const { onNodeDelete, role, templateId } = data;

    const handleDelete = () => {
        onNodeDelete(role, templateId)
    };

    return (
        <Box position="relative" padding="1em" border="1px solid #ccc" borderRadius="8px" bg="white" shadow="md" maxWidth="200px">
            <Box position="absolute" top="-10px" right="-10px">
                <IconButton
                    icon={<CloseIcon />}
                    size="xs"
                    aria-label="Delete Node"
                    onClick={handleDelete}
                />
            </Box>
            <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{data.label}</div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </Box>
    );
};

const CentralCustomNode = ({ data }: any) => {
    const { onOpen } = data;

    return (
        <Box position="relative" padding="1.5em" border="2px solid teal" borderRadius="8px" bg="white" shadow="md">
            <Box position="absolute" top="-10px" left="-10px">
                <IconButton
                    icon={<AddIcon />}
                    size="sm"
                    aria-label="Add Input Node"
                    onClick={() => onOpen(NodeType.INPUT)}
                />
            </Box>
            <Box position="absolute" bottom="-10px" right="-10px">
                <IconButton
                    icon={<AddIcon />}
                    size="sm"
                    aria-label="Add Output Node"
                    onClick={() => onOpen(NodeType.OUTPUT)}
                />
            </Box>
            <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{data.label}</div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </Box>
    );
};

const nodeTypes = { customNode: CustomNode, centralCustomNode: CentralCustomNode };

interface Props {
    mapId: string,
    templates: Array<RecipeTemplateWithRecipeFlows>,
    blacklists: Array<RecipeTemplateBlacklist>
}

interface TemplateBlackList {
    recipeTemplateId: string,
    recipeTemplatePredecesorId: string

}

const TemplateRules = ({ mapId, templates, blacklists }: Props) => {
    // State to track selected template
    const [selectedTemplate, setSelectedTemplate] = useState<RecipeTemplateWithRecipeFlows | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [inputTemplates, setInputTemplates] = useState<Array<RecipeTemplateWithRecipeFlows>>([])
    const [outputTemplates, setOutputTemplates] = useState<Array<RecipeTemplateWithRecipeFlows>>([])
    const [modalType, setModalType] = useState<NodeType | null>(null);
    const [saved, setSaved] = useState<boolean>(false)


    useEffect(() => {
        spreadNodes()
        setSaved(false)
    }, [selectedTemplate, inputTemplates, outputTemplates]);

    useEffect(() => {
        getRules()
        setSaved(false)
    }, [selectedTemplate]);

    const getRules = () => {
        if (selectedTemplate) {
            let inputRules: Array<RecipeTemplateWithRecipeFlows> = Object.assign([], templates)
            let outputRules: Array<RecipeTemplateWithRecipeFlows> = Object.assign([], templates)
            blacklists.forEach((b: RecipeTemplateBlacklist) => {
                const { recipeTemplateId, recipeTemplatePredecesorId } = b
                /////// successor,        predecessor
                if (recipeTemplateId === selectedTemplate.id) { //if selectedTemplate is sucessor, remove predecessors
                    inputRules = inputRules.filter(t => t.id !== selectedTemplate.id)
                } else if (recipeTemplatePredecesorId === selectedTemplate.id) { //if selectedTemplate is predecessors, remove succesors
                    outputRules = outputRules.filter(t => t.id !== selectedTemplate.id)
                }
            });
            setInputTemplates(inputRules)
            setOutputTemplates(outputRules)
        }
    }

    const onNodeDelete = (role: NodeType, templateId: string) => {
        if (role === NodeType.INPUT) setInputTemplates((w) => w.filter(t => t.id !== templateId))
        else setOutputTemplates((w) => w.filter(t => t.id !== templateId))
    };

    const spreadNodes = () => {
        if (selectedTemplate) {
            // Create input nodes at the top
            const inputNodes: Node[] = inputTemplates.map((template, index) => ({
                id: `input-${template.id}`,
                type: 'customNode',
                data: { label: `${template.name}`, onNodeDelete, role: NodeType.INPUT, templateId: template.id },
                position: { x: index * 300, y: 50 }, // Arrange inputs horizontally
            }));

            // Create output nodes below the central node
            const outputNodes: Node[] = outputTemplates.map((template, index) => ({
                id: `output-${template.id}`,
                width: 200,
                type: 'customNode',
                data: { label: `${template.name}`, onNodeDelete, role: NodeType.OUTPUT, templateId: template.id },
                position: { x: index * 300, y: 450 }, // Arrange outputs horizontally
                draggable: true
            }));

            // Central node for the selected template
            const centralNode: Node = {
                id: `center-${selectedTemplate.id}`,
                type: 'centralCustomNode',
                data: {
                    label: `${selectedTemplate.name}`, onOpen: (type: NodeType) => {
                        setModalType(type);
                        onOpen();
                    }
                },
                position: { x: 400, y: 250 },
                draggable: true,
            };

            // Create edges for inputs pointing to the central node
            const inputEdges: Edge[] = inputTemplates.map((template) => ({
                id: `e-${template.id}-to-center`,
                source: `input-${template.id}`,
                target: `center-${selectedTemplate.id}`,
                type: 'smoothstep',
                animated: true,
            }));

            // Create edges for outputs pointing away from the central node
            const outputEdges: Edge[] = outputTemplates.map((template) => ({
                id: `e-center-to-${template.id}`,
                source: `center-${selectedTemplate.id}`,
                target: `output-${template.id}`,
                type: 'smoothstep',
                animated: true,
            }));

            setNodes([...inputNodes, centralNode, ...outputNodes]);
            setEdges([...inputEdges, ...outputEdges]);
        }
    }

    const handleAddTemplate = (template: RecipeTemplateWithRecipeFlows) => {
        if (modalType !== null && selectedTemplate) {

            if (modalType === NodeType.INPUT) {
                if (inputTemplates.find(t => t.id === template.id)) return null;
                setInputTemplates(w => [...w, template])
            } else {
                if (outputTemplates.find(t => t.id === template.id)) return null;
                setOutputTemplates(w => [...w, template])
            }

            onClose();
        }
    };

    const onNodesChange = (changes: NodeChange[]) => {
        setNodes((nds) => {
            return applyNodeChanges(changes, nds)
        });
    };

    const onSave = () => {
        //TODO: we got to go the other way, if we have a whitelist of templates, 
        //we should be able to build the blacklist for each input and output rules arrays

        //fill it with selectedTemplate as predecessor
        if (selectedTemplate) {
            let blacklists: Array<TemplateBlackList> = []
            templates.forEach(t => {
                //fill it with selectedTemplate as successor
                blacklists.push({
                    recipeTemplateId: selectedTemplate.id,
                    recipeTemplatePredecesorId: t.id
                })
            });

            //fill it with selectedTemplate as predecessor
            templates.forEach(t => {
                blacklists.push({
                    recipeTemplateId: t.id,
                    recipeTemplatePredecesorId: selectedTemplate.id
                })
            });

            console.log(blacklists)

            setSaved(true)
        }

    }

    const listTemplates = modalType === NodeType.INPUT ?
        templates.filter(t => !inputTemplates.find(i => i.id === t.id)) :
        templates.filter(t => !outputTemplates.find(i => i.id === t.id))


    return (
        <ReactFlowProvider>
            <Flex direction="column" height="50vh">
                {/* Sidebar with RecipeTemplates */}
                <Flex direction="row" flexGrow={1}>
                    <Box width="20%" padding="2em" borderRight="1px solid #ccc" overflowY="auto">
                        {templates.map((recipe) => (
                            <Button
                                key={recipe.id}
                                width="100%"
                                marginBottom="1em"
                                padding="1.5em"
                                boxShadow="md"
                                _hover={{
                                    backgroundColor: 'teal.500',
                                    color: 'white',
                                    cursor: 'pointer',
                                    boxShadow: 'lg',
                                }}
                                _active={{
                                    transform: 'scale(0.98)',
                                }}
                                onClick={() => setSelectedTemplate(recipe)}
                            >
                                {recipe.name}
                            </Button>
                        ))}
                    </Box>

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
                        {

                        }
                        <Panel position='bottom-center'>
                            {
                                selectedTemplate ?
                                    saved ? <CheckCircleIcon width="50px" height="50px" color={"green"} /> : <Button onClick={onSave} colorScheme='blue'>Save</Button> :
                                    null
                            }
                        </Panel>
                    </Box>
                </Flex>

                {/* Modal for adding templates */}
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Add Template</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {listTemplates.map((template) => (
                                <Button
                                    key={template.id}
                                    width="100%"
                                    marginBottom="1em"
                                    onClick={() => handleAddTemplate(template)} >
                                    {template.name}
                                </Button>
                            ))}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Flex>
        </ReactFlowProvider>
    );
};

export default TemplateRules;
