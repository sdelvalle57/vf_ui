import { useEffect, useState } from "react";
import { EconomicResource, ResourceSpecification, useCreateEconomicResourceMutation, useEconomicResourcesBySpecificationIdLazyQuery } from "../../apollo/__generated__/graphql";
import { Box, Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Textarea, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import Link from 'next/link';
import moment from "moment";

interface ResourceSpecificationsTableProps {
  resources: Array<ResourceSpecification>;
  onSelectedResource: (selectedResource: ResourceSpecification) => void
}


const ResourceSpecificationsTable = ({ resources, onSelectedResource }: ResourceSpecificationsTableProps) => {

  const [fetchEconomicResources, { called, loading, data, error }] = useEconomicResourcesBySpecificationIdLazyQuery();

  const [selectedResource, setSelectedResource] = useState<ResourceSpecification | null>(null);
  const [economicResources, setEconomicResources] = useState<Array<EconomicResource> | null>(null);
  const [loadingEconomicResources, setLoadingEconomicResources] = useState(false);
  const [errorEconomicResources, setErrorEconomicResources] = useState<string | null>()
  const [showNewEconomicResourceModal, setShowEconomicResourceModal] = useState(false);
  const [newEconomicResource, setNewEconomicResource] = useState<ResourceSpecification | null>(null);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [accountingQuantity, setAccountingQuantity] = useState<number | string>('');
  const [trackingIdentifier, setTrackingIdentifier] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [lot, setLot] = useState('');
  const [containedIn, setContainedIn] = useState('');
  const toast = useToast();

  const onShowModal = (resource: ResourceSpecification) => {
    setShowEconomicResourceModal(true);
    setNewEconomicResource(resource)
  }

  const onCloseModal = () => {
    setShowEconomicResourceModal(false);
    setNewEconomicResource(null)
  }

  const [createEconomicResource, { loading: loadingCreating, error: errorCreating, data: dataCreating }] = useCreateEconomicResourceMutation({
    onCompleted: async (data) => {
      toast({
        title: "Economic Resource created.",
        description: `Resource ${data.createEconomicResource.name} was successfully created.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      const { data: res, error, loading } = await fetchEconomicResources({
        variables: {
          resourceSpecificationId: data.createEconomicResource.resourceSpecificationId
        }
      });
      setName('');
      setNote('');
      setAccountingQuantity('');
      setTrackingIdentifier('');
      setCurrentLocation('');
      setLot('');
      setContainedIn('');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEconomicResource({
        variables: {
          resourceSpecificationId: newEconomicResource?.id,
          name,
          note,
          accountingQuantity: Number(accountingQuantity),
          trackingIdentifier,
          currentLocation,
          lot,
          containedIn: containedIn || undefined
        }
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



  useEffect(() => {
    const get = async () => {
      if (selectedResource) {
        const { data, error, loading } = await fetchEconomicResources({
          variables: {
            resourceSpecificationId: selectedResource.id
          }
        });
        if (error) {
          setLoadingEconomicResources(false)
          setEconomicResources(null)
          setErrorEconomicResources(error.message)
        } else if (loading) {
          setLoadingEconomicResources(true)
          setEconomicResources(null)
          setErrorEconomicResources(null)
        } else if (data) {
          setLoadingEconomicResources(false)
          setEconomicResources(data.economicResourcesBySpecificationId)
          setErrorEconomicResources(null)
        }
      }
    }
    get()

  }, [selectedResource])


  const newEconomicResourceModal = () => {
    return (
      <Modal size={"xl"} isOpen={showNewEconomicResourceModal} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New {newEconomicResource?.name} Econonomic Resource</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box maxWidth="400px" mx="auto" mt="5">
              <form onSubmit={handleSubmit}>
                <FormControl id="name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Enter resource name"
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
                <FormControl id="accountingQuantity" isRequired mt={4}>
                  <FormLabel>Accounting Quantity</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter accounting quantity"
                    value={accountingQuantity}
                    onChange={(e) => setAccountingQuantity(e.target.value)}
                  />
                </FormControl>
                <FormControl id="trackingIdentifier" mt={4}>
                  <FormLabel>Tracking Identifier</FormLabel>
                  <Input
                    placeholder="Enter tracking identifier"
                    value={trackingIdentifier}
                    onChange={(e) => setTrackingIdentifier(e.target.value)}
                  />
                </FormControl>
                <FormControl id="currentLocation" isRequired mt={4}>
                  <FormLabel>Current Location</FormLabel>
                  <Input
                    placeholder="Enter current location"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                  />
                </FormControl>
                <FormControl id="lot" mt={4}>
                  <FormLabel>Lot</FormLabel>
                  <Input
                    placeholder="Enter lot information"
                    value={lot}
                    onChange={(e) => setLot(e.target.value)}
                  />
                </FormControl>
                <FormControl id="containedIn" mt={4}>
                  <FormLabel>Contained In (UUID)</FormLabel>
                  <Input
                    placeholder="Enter container ID"
                    value={containedIn}
                    onChange={(e) => setContainedIn(e.target.value)}
                  />
                </FormControl>
                <Button
                  mt={4}
                  colorScheme="teal"
                  isLoading={loading}
                  type="submit"
                >
                  Create Economic Resource
                </Button>
                {error && <Box mt={4} color="red.500">Error: {error.message}</Box>}
              </form>
            </Box>

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onCloseModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  // if (selectedResource && !loading) return (
  //   <EconomicResourceObj
  //     economicResources={economicResources}
  //     error={errorEconomicResources}
  //     resourceSpecification={selectedResource}
  //     onBack={() => {
  //       setEconomicResources(null)
  //       setErrorEconomicResources(null)
  //       setLoadingEconomicResources(false)
  //       setSelectedResource(null)
  //     }} />
  // )


  return (
    <Box maxWidth="80%" textAlign="center" margin="2em auto">
      {newEconomicResourceModal()}
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
              <Th>Action</Th>
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
                <Td>{moment.unix(resource.createdAt).format("DD-MM-YYYY")}</Td>
                <Td>
                  <Link href={{
                    pathname: '/economic_resources',
                    query: { resource_id: resource.id },
                  }}
                    as={`/economic_resources/${resource.id}`}>
                    <Button as="a" colorScheme="teal" size="md">
                      Economic Resources
                    </Button>
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResourceSpecificationsTable