import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { useGetTemplatesAccessByAgentQuery } from "../../apollo/__generated__/graphql";
import { Alert, Spinner } from "@chakra-ui/react";
import RecipeTemplatesTable from "./table";


const MyTemplatesComponent = () => {
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);

    const { loading, data, error: queryError } = useGetTemplatesAccessByAgentQuery({
        variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
        skip: !selectedAgent,
        pollInterval: 5000  // Skip the query if selectedAgent is null
    });

    console.log(data)

    if (queryError) return <Alert status='error'>{queryError.message}</Alert>
    if (loading) return <Spinner />
    if(data?.getTemplatesAccessByAgent) {
        return <RecipeTemplatesTable noAction={true} templates={data.getTemplatesAccessByAgent} />
    }
    return null;
}

export default MyTemplatesComponent;