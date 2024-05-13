import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
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
      default: "#08364d",
      paper: "#0f618a",
    },
    text: {
      primary: "#fff",
    },
  },
});

export default darkTheme;
