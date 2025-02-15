import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6200ee",
    },
    secondary: {
      main: "#03dac6",
    },
    error: {
      main: "#cf6679",
    },
    background: {
      default: "#f0f0f0",
    },
  },
});

export default lightTheme;
