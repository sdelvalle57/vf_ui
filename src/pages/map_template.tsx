import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { useGetMapTemplateByIdQuery } from '../apollo/__generated__/graphql';
import { Box, Card, CardBody, Heading, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import RecipeTemplatesTable from '../components/Templates/table';
import NewTemplate from '../components/Templates/new_template';
import TemplateRules from './template_rules';

const MapTemplatePage: NextPage = () => {
    const router = useRouter();
    const { map_id } = router.query;

    const { data, loading, error } = useGetMapTemplateByIdQuery({
        variables: { mapId: map_id as string },
        pollInterval: 5000,
        skip: !map_id,
    });

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    if (data?.getMapTemplateById) {
        const { getMapTemplateById: mapTemplate } = data;
        console.log(mapTemplate)
        return (
            <Box>
                <Card style={{margin: "2em auto", textAlign:"center"}} maxW='sm'>
                    <CardBody>
                        <Stack mt='6' spacing='3'>
                            <Heading size='md'>Info</Heading>
                            <Text>ID: {mapTemplate.map.id}</Text>
                            <Text>{mapTemplate.map.name}</Text>
                            <Text>{mapTemplate.map.type}</Text>
                        </Stack>
                    </CardBody>
                </Card>

                <Tabs>
                    <TabList>
                        <Tab>Templates</Tab>
                        <Tab>Rules</Tab>
                        <Tab>New Template</Tab>
                    </TabList>
    
                    <TabPanels>
                        <TabPanel><RecipeTemplatesTable noAction={true} templates={mapTemplate.templates} /></TabPanel>
                        <TabPanel><TemplateRules templates={mapTemplate.templates} /></TabPanel>
                        <TabPanel><NewTemplate mapId={mapTemplate.map.id} /></TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        );
    }

    return <div>No data found</div>;
}

export default MapTemplatePage

