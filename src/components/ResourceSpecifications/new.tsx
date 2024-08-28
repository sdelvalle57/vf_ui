import { Agent, ResourceSpecification, ResourceType, useCreateResourceSpecificationMutation } from "../../apollo/__generated__/graphql";
import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Select, Textarea, useToast } from "@chakra-ui/react";

interface CreateResourceSpecificationFormProps {
    agent: Agent,
  }
  
  const CreateResourceSpecificationForm: React.FC<CreateResourceSpecificationFormProps> = ({ agent }) => {
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
            agentId: agent.id,
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

  export default CreateResourceSpecificationForm;