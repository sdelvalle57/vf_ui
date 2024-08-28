import { Box, Button, FormControl, FormLabel, Input, Textarea, Toast, useToast } from "@chakra-ui/react"
import { EconomicResource, ResourceSpecification, useCreateEconomicResourceMutation } from "../../apollo/__generated__/graphql"
import { useState } from "react";

interface Props {
    resourceSpecification: ResourceSpecification,
    onNewEconomicResource: (economicResource: EconomicResource) => void
}


const NewEconomicResource = ({ resourceSpecification, onNewEconomicResource }: Props) => {
    const [name, setName] = useState('');
    const [note, setNote] = useState('');
    const [accountingQuantity, setAccountingQuantity] = useState<number | string>('');
    const [trackingIdentifier, setTrackingIdentifier] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');
    const [lot, setLot] = useState('');
    const [containedIn, setContainedIn] = useState('');
    const toast = useToast();

    const [createEconomicResource, { loading, error }] = useCreateEconomicResourceMutation({
        onCompleted: async (data) => {
            toast({
                title: "Economic Resource created.",
                description: `Resource ${data.createEconomicResource.name} was successfully created.`,
                status: "success",
                duration: 5000,
                isClosable: true,
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
            const { data } = await createEconomicResource({ 
                variables: { 
                    resourceSpecificationId: resourceSpecification.id, 
                    name, 
                    note, 
                    accountingQuantity: Number(accountingQuantity), 
                    trackingIdentifier, 
                    currentLocation, 
                    lot, 
                    containedIn: containedIn || undefined 
                } 
            });
            if(data) {
                onNewEconomicResource(data.createEconomicResource)
            }
      
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
      

    return (
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
                    type="submit" >
                    Create Economic Resource
                </Button>
                {error && <Box mt={4} color="red.500">Error: {error.message}</Box>}
            </form>
        </Box>
    )


}

export default NewEconomicResource