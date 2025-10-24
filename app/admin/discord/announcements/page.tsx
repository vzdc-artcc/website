import {Card, CardContent, Typography} from "@mui/material";
import DiscordAnnouncementForm from "@/components/Discord/DiscordAnnouncementForm";

export default function AdminAnnouncementsPage() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>Discord Announcement</Typography>
                <DiscordAnnouncementForm/>
            </CardContent>
        </Card>
    );
}