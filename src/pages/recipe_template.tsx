import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { useGetTemplateByIdLazyQuery, useRecipeByIdLazyQuery } from '../apollo/__generated__/graphql';
import { useEffect } from 'react';
import { Alert, Spinner } from '@chakra-ui/react';
import RecipeInfo from '../components/Recipes/info';
import RecipeTemplateInfo from '../components/Templates/recipe_template_info';

const RecipeTemplatePage: NextPage = () => {
    const router = useRouter();
    const { recipe_template_id } = router.query;

    const [fetchRecipeTemplate, { loading, data, error }] = useGetTemplateByIdLazyQuery()


    useEffect(() => {
        const get = async () => {
            await fetchRecipeTemplate({
                variables: {
                    templateId: recipe_template_id
                }
            });
        }
        get()
    }, [recipe_template_id])

    console.log(data)

    // if (!recipe_id) return <Alert status='error'>No Resource Specification Id Provided</Alert>
    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if(data) return <RecipeTemplateInfo recipeTemplate={data.getTemplateById} />
    return null
}

export default RecipeTemplatePage

