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
  useTheme
} from "@mui/material";
import { toast } from "react-toastify";
import generateRandomFlightPlan from "@/components/RoutePractice/RandomFlightPlan";

export default function RoutePracticeForm({
  initialPlan,
}: {
  initialPlan: any;
}) {
  const [flightPlan, setFlightPlan] = React.useState<any>(initialPlan);

  const theme = useTheme();
  

  React.useEffect(() => {
    setFlightPlan(generateRandomFlightPlan());
  }, []);

  const [checkboxes, setCheckboxes] = React.useState({
    alt: false,
    eq: false,
    rte: false,
  });

  const [correct, setCorrect] = React.useState(0);
  const [incorrect, setIncorrect] = React.useState(0);

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
      setIncorrect(incorrect + 1);
    } else {
      setFlightPlan(generateRandomFlightPlan());
      toast.success("The flight plan was correct!", {
        autoClose: 2000,
        pauseOnFocusLoss: false,
      });
      setCorrect(correct + 1);
    }
  };

  const handleSubmit = () => {
    if (
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
      setCorrect(correct + 1);
    } else {
      toast.error("Sorry, this flight plan is incorrect", {
        autoClose: 2000,
        pauseOnFocusLoss: false,
      });
      setIncorrect(incorrect + 1);
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
    }
  }, [checkboxes, flightPlan]);

  const backgroundColor = theme.palette.mode === "dark" ? "black" : "none";
  const textColor = theme.palette.mode === "dark" ? "skyblue" : "black"

  return (
    <Box>
      <Grid2
        container
        spacing={2}
        columns={8}
        style={{ paddingBottom: 20, background: backgroundColor, paddingTop: 20 }}
      >
        <Grid2 size={1}>
          <Typography align="center">AID</Typography>
          <Typography align="center" style={{ color: textColor }}>
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
                color: textColor,
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
                color: textColor,
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
                color: textColor,
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
                color: textColor,
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
                color: textColor,
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
                color: textColor,
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
                color: textColor,
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
                color: textColor,
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
                color: textColor,
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
                color: textColor,
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

        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="success" onClick={handleNoErrors}>
            No Errors
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>

      <Box sx={{ width: "100%", mt: 3 }}>
        <Box
          sx={{
            position: "relative",
            height: 20,
            borderRadius: 5,
            overflow: "hidden",
            background: "#333",
          }}
        >
          <Box
            sx={(theme) => {
              const total = correct + incorrect;
              if (total === 0) return { background: "transparent" };

              const correctPct = (correct / total) * 100;
              const incorrectPct = (incorrect / total) * 100;

              return {
                height: "100%",
                width: "100%",
                background: `linear-gradient(
            to right,
            ${theme.palette.success.main} ${correctPct}%,
            #5c0c0c ${correctPct}% ${correctPct + incorrectPct}%,
            transparent ${correctPct + incorrectPct}%
          )`,
              };
            }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="body2" sx={{ color: "success.main" }}>
            Correct: {correct}
          </Typography>
          <Typography variant="body2" sx={{ color: "#5c0c0c" }}>
            Incorrect: {incorrect}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
