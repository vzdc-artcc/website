"use client";
import React from "react";
import {
  TextField,
  Grid2,
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import generateRandomFlightPlan from "@/components/RoutePractice/RandomFlightPlan";
import { BorderRight } from "@mui/icons-material";

export default function RoutePracticeForm({
  initialPlan,
}: {
  initialPlan: any;
}) {
  const [flightPlan, setFlightPlan] = React.useState<any>(initialPlan);

  React.useEffect(() => {
    setFlightPlan(generateRandomFlightPlan());
  }, []);

  const [checkboxes, setCheckboxes] = React.useState({
    alt: false,
    eq: false,
    rte: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxes({
      ...checkboxes,
      [event.target.name]: event.target.checked,
    });
  };

  const handleNoErrors = () => {
    if (flightPlan.iafdof || flightPlan.wrongEq || flightPlan.wrongRoute) {
      toast.error("Sorry, this flight plan is incorrect", {
        autoClose: 2000,
        pauseOnFocusLoss: false,
      });
    } else {
      setFlightPlan(generateRandomFlightPlan());
      toast.success("The flight plan was correct!", {
        autoClose: 2000,
        pauseOnFocusLoss: false,
      });
    }
  };

  const hasAnyError =
    flightPlan.iafdof ||
    flightPlan.wrongEq ||
    flightPlan.wrongRoute ||
    flightPlan.missingTransition;

  React.useEffect(() => {
    if (
      hasAnyError && // ✅ only if there is at least one error
      checkboxes.alt === flightPlan.iafdof &&
      checkboxes.eq === flightPlan.wrongEq &&
      checkboxes.rte ===
        (!!flightPlan.wrongRoute || flightPlan.missingTransition)
    ) {
      setFlightPlan(generateRandomFlightPlan());
      setCheckboxes({ alt: false, eq: false, rte: false });
      toast.success("You caught all the errors!", {
        autoClose: 2000,
      });
    }
  }, [checkboxes, flightPlan]);

  return (
    <Box>
      <Grid2 container spacing={2} columns={8} style={{ paddingBottom: 20, background: "black", paddingTop: 20}}>
        <Grid2 size={1}>
          <Typography align="center">AID</Typography>
          <Typography align="center" style={{ color: "skyblue" }}>
            {flightPlan.callsign}
          </Typography>
        </Grid2>
        <Grid2 size={0.5}>
          <Typography align="center">CID</Typography>
          <TextField
            value={flightPlan.cid}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                color: "skyblue",
              },
            }}
          />
        </Grid2>
        <Grid2 size={0.75}>
          <Typography align="center">BCN</Typography>
          <TextField
            value={flightPlan.bcn}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                color: "skyblue",
              },
            }}
          />
        </Grid2>
        <Grid2 size={1}>
          <Typography align="center">TYP</Typography>
          <TextField
            value={flightPlan.typ}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                color: "skyblue",
              },
            }}
          />
        </Grid2>
        <Grid2 size={0.5}>
          <Typography align="center">EQ</Typography>
          <TextField
            value={flightPlan.eq}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                color: "skyblue",
              },
            }}
          />
        </Grid2>
        <Grid2 size={1}>
          <Typography align="center">DEP</Typography>
          <TextField
            value={flightPlan.dep}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                color: "skyblue",
              },
            }}
          />
        </Grid2>
        <Grid2 size={1}>
          <Typography align="center">DEST</Typography>
          <TextField
            value={flightPlan.dest}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                color: "skyblue",
              },
            }}
          />
        </Grid2>
        <Grid2 size={1}>
          <Typography align="center">SPD</Typography>
          <TextField
            value={flightPlan.spd}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                color: "skyblue",
              },
            }}
          />
        </Grid2>
        <Grid2 size={1}>
          <Typography align="center">ALT</Typography>
          <TextField
            value={flightPlan.alt}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                color: "skyblue",
              },
            }}
          />
        </Grid2>
        <Grid2 size={0.75}>
          <Typography align="right">RTE</Typography>
        </Grid2>
        <Grid2 size={7}>
          <TextField
            fullWidth
            multiline
            value={flightPlan.rte}
            sx={{
              "& .MuiInputBase-input": {
                color: "skyblue",
              },
            }}
          />
        </Grid2>
        <Grid2 size={0.75}>
          <Typography align="right">RMK</Typography>
        </Grid2>
        <Grid2 size={7}>
          <TextField
            fullWidth
            value={"FOR TRAINING USE ONLY"}
            sx={{
              "& .MuiInputBase-input": {
                color: "skyblue",
              },
            }}
          />
        </Grid2>
      </Grid2>
      <Box display="flex" flexDirection="column" alignItems="flex-end" mt={2}>
        <FormControl component="fieldset" variant="standard">
          <FormLabel
            sx={{
              color: "text.primary",
              "&.Mui-focused": { color: "text.primary" },
              "&.Mui-disabled": { color: "text.primary" },
              "&.Mui-error": { color: "text.primary" },
            }}
          >
            Potential Errors
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checkboxes.alt}
                  onChange={handleChange}
                  name="alt"
                />
              }
              label="Altitude"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={checkboxes.eq}
                  onChange={handleChange}
                  name="eq"
                />
              }
              label="Equipment Suffix"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={checkboxes.rte}
                  onChange={handleChange}
                  name="rte"
                />
              }
              label="Route"
            />
          </FormGroup>
        </FormControl>

        <Button
          variant="contained"
          color="success"
          onClick={handleNoErrors}
          sx={{ mt: 2 }}
        >
          No Errors
        </Button>
      </Box>
    </Box>
  );
}
