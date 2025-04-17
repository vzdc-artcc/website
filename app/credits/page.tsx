import {Card, CardContent, Grid2, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {GitHub} from "@mui/icons-material";
import {Aguafina_Script} from "next/font/google";

const fancyFont = Aguafina_Script({subsets: ['latin'], weight: ["400"]});

export default async function Home() {

    return (
        (<Grid2 container columns={6} spacing={4}>
            <Grid2 size={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h3">Credit Information</Typography>
                        <Typography variant="body2">Full Commit History can be found on <Link
                            href="https://github.com/vZDC-ARTCC/website" target="_blank"
                            style={{color: '#29B6F6', textDecoration: 'none',}}>our public GitHub.</Link></Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>Main Contributors</Typography>
                        <Stack direction="column" spacing={4} sx={{m: 8,}}>
                            <Typography color="darkred" variant="h5" fontWeight="bold" fontSize={70}
                                        letterSpacing={15} {...fancyFont.style}>Aneesh&nbsp;&nbsp;Reddy <Link
                                href="https://github.com/beabravedude" target="_blank"
                                style={{color: 'inherit',}}><GitHub fontSize="large"/></Link></Typography>
                            <Typography variant="h5">Carson Berget <Link
                                href="https://github.com/Vainnor" target="_blank" style={{color: 'inherit',}}><GitHub
                                fontSize="medium"/></Link></Typography>
                            <Typography variant="h5">Harry
                                Xu <Link href="https://github.com/harryxu2626" target="_blank"
                                         style={{color: 'inherit',}}><GitHub fontSize="small"/></Link></Typography>
                            <Typography variant="h5">Leo
                                Roberts <Link href="https://github.com/monty23monty" target="_blank"
                                              style={{color: 'inherit',}}><GitHub fontSize="small"/></Link></Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>)
    );
}
