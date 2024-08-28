import type { NextPage } from 'next'
import EconomicResourcesElement from '../components/EconomicResources';
import { useRouter } from 'next/router';
import { Alert, Spinner } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useResourceSpecificationByIdLazyQuery } from '../apollo/__generated__/graphql';

const EconomicResourcesPage: NextPage = () => {
    const router = useRouter();
    const { resource_id } = router.query;
    const [fetchResourceSpecification, { loading, data, error }] = useResourceSpecificationByIdLazyQuery();

    useEffect(() => {
        const get = async () => {
            await fetchResourceSpecification({
                variables: {
                    resourceSpecificationId: resource_id
                }
            });
        }
        get()
    }, [resource_id])
    
    if (!resource_id) return <Alert status='error'>No Resource Specification Id Provided</Alert>
    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if(data) return <EconomicResourcesElement resourceSpecification={data.resourceSpecificationById} />
    return null
}

export default EconomicResourcesPage

