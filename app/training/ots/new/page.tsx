import { Card, CardContent, Typography } from "@mui/material";
import OtsRecommendationForm from "@/components/OtsRecommendation/OtsRecommendationForm";

export default function Page() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New OTS Recommendation</Typography>
                <OtsRecommendationForm />
            </CardContent>
        </Card>
    );
}
