import { Box, Button, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const navigate = useNavigate();
	const handleLogin = async () => {
		toast.success("Login works.");
		navigate("/");
	};

	return (
		<Box
			sx={{
				height: "100vh",
				width: "100vw",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 4,
				padding: 4,
				backgroundColor: "#F5F5F5",
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 2,
				}}
			>
				<Typography
					sx={{
						fontSize: "34px",
						fontWeight: 600,
						textAlign: "center",
					}}
				>
					Welcome to MedVault.
				</Typography>

				<Typography
					sx={{
						fontFamily: "Poppins, sans-serif",
						fontSize: "30px",
						fontWeight: 500,
						color: "#092147",
						textAlign: "center",
					}}
				>
					Secure. Private. Decentralized Health.
				</Typography>
			</Box>

			<Button
                variant="contained"
				sx={{
					fontSize: "20px",
					textTransform: "capitalize",
					paddingY: 1.5,
					width: "100%",
					maxWidth: "400px",
				}}
                onClick={handleLogin}
            >
                Continue with MetaMask
			</Button>
		</Box>
	);
}
