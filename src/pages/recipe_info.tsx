import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { useRecipeByIdLazyQuery } from '../apollo/__generated__/graphql';
import { useEffect } from 'react';
import { Alert, Spinner } from '@chakra-ui/react';
import RecipeInfo from '../components/Recipes/info';

const RecipeInfoPage: NextPage = () => {
    const router = useRouter();
    const { recipe_id } = router.query;

    const [fetchRecipe, { loading, data, error }] = useRecipeByIdLazyQuery()


    useEffect(() => {
        const get = async () => {
            await fetchRecipe({
                variables: {
                    recipeId: recipe_id
                }
            });
        }
        get()
    }, [recipe_id])

    if (!recipe_id) return <Alert status='error'>No Resource Specification Id Provided</Alert>
    if (error) return <Alert status='error'>{error.message}</Alert>
    if (loading) return <Spinner />
    if(data) return <RecipeInfo recipe={data.recipeById} />
    return null
}

export default RecipeInfoPage

