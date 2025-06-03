import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login.tsx";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Toaster } from "react-hot-toast";

const theme = createTheme({
	palette: {
		primary: {
			main: "#092147",
			light: "#174384",
			contrastText: "#F5F5F5",
		},
		secondary: {
			main: "#F5F5F5",
			contrastText: "#092147",
		},
		error: {
			main: "#DD3636",
		},
		success: {
			main: "#66FF77",
		},
		background: {
			default: "#F5F5F5",
		},
	},
	typography: {
		allVariants: {
			color: "#092147",
			fontFamily: "Poppins",
		},
	},
});

const router = createBrowserRouter([
	{
		path: "/login",
		element: <Login />,
	},
]);

createRoot(document.getElementById("root")!).render(
	<ThemeProvider theme={theme}>
		<CssBaseline />
		<RouterProvider router={router} />
		<Toaster
			position="bottom-center"
			toastOptions={{
				success: {
					style: {
						background: theme.palette.success.main,
					},
				},
				error: {
					style: {
						background: theme.palette.error.main,
						color: "#F5F5F5",
					},
				},
			}}
		/>
	</ThemeProvider>
);
