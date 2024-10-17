import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { MapTemplateResponse, RecipeTemplateBlacklist, useGetMapTemplateByIdQuery } from '../apollo/__generated__/graphql';
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


        return (
            <Box>
                <Card style={{margin: "1em auto", textAlign:"center"}} maxW='sm'>
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
                        <Tab>Process Templates</Tab>
                        <Tab>New Process Template</Tab>
                        <Tab>Process Rules</Tab>
                    </TabList>
    
                    <TabPanels>
                        <TabPanel><RecipeTemplatesTable noAction={true} templates={mapTemplate.templates} /></TabPanel>
                        <TabPanel><NewTemplate mapId={mapTemplate.map.id} /></TabPanel>
                        {/* TODO: should send inputs and outputs templates according to DB */}
                        <TabPanel>
                            <TemplateRules
                                mapId={mapTemplate.map.id}
                                blacklists={mapTemplate.blacklists}
                                templates={mapTemplate.templates}/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        );
    }

    return <div>No data found</div>;
}

export default MapTemplatePage

