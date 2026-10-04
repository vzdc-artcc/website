import {EventPositionPresetTable} from "@/components/EventPositionPreset/EventPositionPresetTable";
import {Add} from "@mui/icons-material";
import {Button, Card, CardContent, Link, Stack, Typography} from "@mui/material";

export default function Page() {
  return (
      <Card>
          <CardContent>
              <Stack direction="row" sx={{
                  justifyContent: "space-between"
              }}>
                  <Typography variant="h5">Event Position Presets</Typography>
                  <Link href="/events/admin/event-presets/new">
                      <Button variant="contained" size="large" startIcon={<Add/>}>New Position Preset</Button>
                  </Link>
              </Stack>
              <EventPositionPresetTable/>
          </CardContent>
      </Card>
  );
}