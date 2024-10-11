import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, useReactFlow, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Flex, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { RecipeTemplateWithRecipeFlows } from '../apollo/__generated__/graphql';
import { ArrowBackIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';

interface Props {
    templates: Array<RecipeTemplateWithRecipeFlows>;
}

const CustomNode = ({ id, data }: any) => {
    const { setNodes } = data;

    const handleDelete = () => {
        setNodes((nds: Node[]) => nds.filter((node) => node.id !== id));
    };

    return (
        <Box position="relative" padding="1em" border="1px solid #ccc" borderRadius="8px" bg="white" shadow="md">
            <Box position="absolute" top="-10px" right="-10px">
                <IconButton
                    icon={<CloseIcon />}
                    size="xs"
                    aria-label="Delete Node"
                    onClick={handleDelete}
                />
            </Box>
            <div>{data.label}</div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </Box>
    );
};

const CentralCustomNode = ({ id, data }: any) => {
    const { setNodes, onOpen } = data;

    return (
        <Box position="relative" padding="1.5em" border="2px solid teal" borderRadius="8px" bg="white" shadow="md">
            <Box position="absolute" top="-10px" left="-10px">
                <IconButton
                    icon={<AddIcon />}
                    size="sm"
                    aria-label="Add Input Node"
                    onClick={() => onOpen('input')}
                />
            </Box>
            <Box position="absolute" bottom="-10px" right="-10px">
                <IconButton
                    icon={<AddIcon />}
                    size="sm"
                    aria-label="Add Output Node"
                    onClick={() => onOpen('output')}
                />
            </Box>
            <div>{data.label}</div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </Box>
    );
};

const nodeTypes = { customNode: CustomNode, centralCustomNode: CentralCustomNode };

const TemplateRules = ({ templates }: Props) => {
    // State to track selected template
    const [selectedTemplate, setSelectedTemplate] = useState<RecipeTemplateWithRecipeFlows | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalType, setModalType] = useState<'input' | 'output' | null>(null);

    useEffect(() => {
        if (selectedTemplate) {
            // Create input nodes at the top
            const inputNodes: Node[] = templates.map((template, index) => ({
                id: `input-${template.id}`,
                type: 'customNode',
                data: { label: `Input: ${template.name}`, setNodes },
                position: { x: index * 200 + 150, y: 50 }, // Arrange inputs horizontally
            }));

            // Create output nodes below the central node
            const outputNodes: Node[] = templates.map((template, index) => ({
                id: `output-${template.id}`,
                type: 'customNode',
                data: { label: `Output: ${template.name}`, setNodes },
                position: { x: index * 200 + 150, y: 450 }, // Arrange outputs horizontally
            }));

            // Central node for the selected template
            const centralNode: Node = {
                id: `center-${selectedTemplate.id}`,
                type: 'centralCustomNode',
                data: { label: `Selected: ${selectedTemplate.name}`, setNodes, onOpen: (type: 'input' | 'output') => {
                    setModalType(type);
                    onOpen();
                }},
                position: { x: 400, y: 250 },
                draggable: false,
            };

            // Create edges for inputs pointing to the central node
            const inputEdges: Edge[] = templates.map((template) => ({
                id: `e-${template.id}-to-center`,
                source: `input-${template.id}`,
                target: `center-${selectedTemplate.id}`,
                type: 'smoothstep',
                animated: true,
            }));

            // Create edges for outputs pointing away from the central node
            const outputEdges: Edge[] = templates.map((template) => ({
                id: `e-center-to-${template.id}`,
                source: `center-${selectedTemplate.id}`,
                target: `output-${template.id}`,
                type: 'smoothstep',
                animated: true,
            }));

            setNodes([...inputNodes, centralNode, ...outputNodes]);
            setEdges([...inputEdges, ...outputEdges]);
        }
    }, [selectedTemplate, templates]);

    const onNodesDelete = (nodesToDelete: Node[]) => {
        const filteredNodes = nodes.filter((node) => !nodesToDelete.find((n) => n.id === node.id));
        setNodes(filteredNodes);
    };

    const handleAddTemplate = (template: RecipeTemplateWithRecipeFlows) => {
        if (modalType && selectedTemplate) {
            const newNodeId = `${modalType}-${template.id}`;
            const newNode: Node = {
                id: newNodeId,
                type: 'customNode',
                data: { label: `${modalType === 'input' ? 'Input' : 'Output'}: ${template.name}`, setNodes },
                position: modalType === 'input' ? { x: nodes.length * 200 + 150, y: 50 } : { x: nodes.length * 200 + 150, y: 450 },
            };
            const newEdge: Edge = {
                id: `e-${newNodeId}-to-center`,
                source: modalType === 'input' ? newNodeId : `center-${selectedTemplate.id}`,
                target: modalType === 'input' ? `center-${selectedTemplate.id}` : newNodeId,
                type: 'smoothstep',
                animated: true,
            };

            setNodes((prevNodes) => [...prevNodes, newNode]);
            setEdges((prevEdges) => [...prevEdges, newEdge]);
            onClose();
        }
    };

    return (
        <Flex direction="column" height="100vh">
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
                        snapToGrid={true}
                        onNodesDelete={(evt) => onNodesDelete(evt)}
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                </Box>
            </Flex>

            {/* Modal for adding templates */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Template</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {templates.map((template) => (
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
    );
};

export default TemplateRules;
