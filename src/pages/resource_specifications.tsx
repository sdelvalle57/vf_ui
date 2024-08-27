import type { NextPage } from 'next';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner, Alert, TableContainer, Table, Thead, Tr, Th, Tbody, Td, FormControl, FormLabel, Input, Select, Textarea, Button, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { ResourceSpecification, useCreateResourceSpecificationMutation, ResourceType, useResourceSpecificationsByAgentQuery, Agent } from '../apollo/__generated__/graphql';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/rootReducer';

const ResourceSpecificationsPage: NextPage = () => {
  const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);

  const { data, loading, error } = useResourceSpecificationsByAgentQuery({
    variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
    skip: !selectedAgent,  // Skip the query if selectedAgent is null
  });

  const [resources, setResources] = useState<Array<ResourceSpecification>>([]);

  useEffect(() => {
    if (data?.resourceSpecificationsByAgent) {
      setResources(data.resourceSpecificationsByAgent);
    }
  }, [data]);

  if (!selectedAgent) {
    return <Alert status="warning">No agent selected. Please select an agent to view resource specifications.</Alert>;
  }

  if (error) return <Alert status="error">{error.message}</Alert>;
  if (loading) return <Spinner />;
  if (!data) return null;

  const onNewResourceSpecification = (resource: ResourceSpecification) => {
    setResources([...resources, resource]);
  };

  return (
    <Box>
      <Tabs>
        <TabList>
          <Tab>Resource Specifications</Tab>
          <Tab>New Resource Specification</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ResourceSpecificationsTable resources={resources} />
          </TabPanel>
          <TabPanel>
            <CreateResourceSpecificationForm agent={selectedAgent}  onNewResourceSpecification={onNewResourceSpecification} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ResourceSpecificationsPage;

interface ResourceSpecificationsTableProps {
  resources: Array<ResourceSpecification>;
}

const ResourceSpecificationsTable = ({ resources }: ResourceSpecificationsTableProps) => {
  return (
    <Box maxWidth="80%" textAlign="center" margin="2em auto">
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Note</Th>
              <Th>Resource Type</Th>
              <Th>Unit of Measure</Th>
              <Th>Created At</Th>
            </Tr>
          </Thead>
          <Tbody>
            {resources.map((resource) => (
              <Tr key={resource.id}>
                <Td>{resource.id}</Td>
                <Td>{resource.name}</Td>
                <Td>{resource.note}</Td>
                <Td>{resource.resourceType}</Td>
                <Td>{resource.unitOfMeasure}</Td>
                <Td>{new Date(resource.createdAt).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};




interface CreateResourceSpecificationFormProps {
  agent: Agent,
  onNewResourceSpecification: (resource: ResourceSpecification) => void;
}

const CreateResourceSpecificationForm: React.FC<CreateResourceSpecificationFormProps> = ({ onNewResourceSpecification, agent }) => {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>(ResourceType.Resource);
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const toast = useToast();

  const [createResourceSpecification, { loading, error }] = useCreateResourceSpecificationMutation({
    onCompleted: (data) => {
      toast({
        title: 'Resource Specification created.',
        description: `Resource Specification ${data.createResourceSpecification.name} was successfully created.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onNewResourceSpecification(data.createResourceSpecification);
      setName('');
      setNote('');
      setResourceType(ResourceType.Resource); // Reset to default
      setUnitOfMeasure('');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createResourceSpecification({
        variables: {
          agentId: agent.id ,
          name,
          note,
          resourceType,
          unitOfMeasure,
        },
      });
    } catch (err: any) {
      toast({
        title: 'An error occurred.',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="400px" mx="auto" mt="5">
      <form onSubmit={handleSubmit}>
        
        <FormControl id="name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
        <FormControl id="note" mt={4}>
          <FormLabel>Note</FormLabel>
          <Textarea
            placeholder="Enter a note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </FormControl>
        <FormControl id="resourceType" isRequired mt={4}>
          <FormLabel>Resource Type</FormLabel>
          <Select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as ResourceType)}
          >
            <option value={ResourceType.Resource}>Resource</option>
            <option value={ResourceType.Asset}>Asset</option>
            <option value={ResourceType.Product}>Product</option>
          </Select>
        </FormControl>
        <FormControl id="unitOfMeasure" isRequired mt={4}>
          <FormLabel>Unit of Measure</FormLabel>
          <Input
            placeholder="Enter unit of measure"
            value={unitOfMeasure}
            onChange={(e) => setUnitOfMeasure(e.target.value)}
          />
        </FormControl>
        <Button mt={4} colorScheme="teal" isLoading={loading} type="submit">
          Create Resource Specification
        </Button>
        {error && (
          <Box mt={4} color="red.500">
            Error: {error.message}
          </Box>
        )}
      </form>
    </Box>
  );
};