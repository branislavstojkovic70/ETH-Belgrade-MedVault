import {
	Box,
	Button,
	CircularProgress,
	SvgIcon,
	Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { login } from "../services/sapphire-service";
import { isMetaMaskInstalled } from "../util/wallet-utils";
import { useState } from "react";
// @ts-ignore
import Logo from "../assets/logo-dark.svg?react";
// @ts-ignore
import MetaMaskLogo from "../assets/metamask.svg?react";

export default function Login() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		if (!isMetaMaskInstalled()) {
			toast.error("MetaMask extension is needed to proceed.");
			return;
		}
		setLoading(true);
		try {
			await login();
			navigate("/");
		} catch (err) {
			console.error("Failed to login:", err);
			toast.error("Login failed.");
		} finally {
			setLoading(false);
		}
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
				<SvgIcon
					id={"logo"}
					inheritViewBox
					component={Logo}
					sx={{
						width: "350px",
						height: "auto",
					}}
				/>

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
				sx={{
					fontSize: "20px",
					textTransform: "capitalize",
					paddingY: 1.5,
					width: "100%",
					maxWidth: "400px",
				}}
				startIcon={
					loading ? (
						<CircularProgress size={24} sx={{ color: "white" }} />
					) : (
						<MetaMaskLogo style={{ width: 30, height: 30 }} />
					)
				}
				variant="contained"
				disabled={loading}
				onClick={handleLogin}
			>
				{loading ? "Connecting..." : "Continue with MetaMask"}
			</Button>
		</Box>
	);
}
