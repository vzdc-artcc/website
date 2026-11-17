import { Card, CardContent, Typography } from "@mui/material";
import OtsRecommendationForm from "@/components/OtsRecommendation/OtsRecommendationForm";
import RequirePermission from "@/components/Access/RequirePermission";

export default function Page() {
    return (
        <RequirePermission perm="training.ots_recommendations.create">
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>New OTS Recommendation</Typography>
                    <OtsRecommendationForm />
                </CardContent>
            </Card>
        </RequirePermission>
    );
}
