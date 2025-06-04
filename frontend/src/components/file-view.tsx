import { useFormik } from "formik";
import * as yup from "yup";
import {
	Box,
	Button,
	MenuItem,
	TextField,
	Typography,
	CircularProgress,
	Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, type Params } from "react-router-dom";
import type { FileInfo } from "../domain/file-info";
import { fetchAndDecryptFile } from "../services/pinata-service";
import { fetchOwnerFile, grantAccess } from "../services/sapphire-service";

const validationSchema = yup.object({
	wallet: yup
		.string()
		.required("Wallet address is required")
		.matches(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
	duration: yup.number().required("Duration is required"),
});

export default function FileView() {
	const { fileId } = useParams<Params>();
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [fileMeta, setFileMeta] = useState<FileInfo>();
	const [accessToken, setAccessToken] = useState<string>("");

	const [loadingMeta, setLoadingMeta] = useState<boolean>(false);
	const [loadingFile, setLoadingFile] = useState<boolean>(false);
	const [loadingToken, setLoadingToken] = useState<boolean>(false);

	// Fetch file metadata
	useEffect(() => {
		setLoadingMeta(true);
		fetchOwnerFile(fileId!)
			.then((meta) => {
				setFileMeta(meta!);
			})
			.catch((err) => {
				console.error("Failed to fetch file metadata:", err);
				toast.error("Could not load file metadata.");
			})
			.finally(() => {
				setLoadingMeta(false);
			});
	}, [fileId]);

	// Once we have fileMeta, fetch & decrypt the file
	useEffect(() => {
		if (!fileMeta) return;
		setLoadingFile(true);
		fetchAndDecryptFile(fileMeta.cid, fileMeta.key, fileMeta.iv)
			.then((blob) => {
				setPreviewUrl(URL.createObjectURL(blob));
			})
			.catch((err) => {
				console.error("There was an error fetching the file:", err);
				toast.error("There was an error fetching the file.");
			})
			.finally(() => {
				setLoadingFile(false);
			});
	}, [fileMeta]);

	const formik = useFormik({
		initialValues: {
			wallet: "",
			duration: 15,
		},
		validationSchema,
		onSubmit: async (values) => {
			if (!fileMeta) return;
			setLoadingToken(true);
			try {
				const token = await grantAccess(
					values.wallet,
					fileMeta.fileId,
					values.duration
				);
				toast.success("Access granted.");
				setAccessToken(token);
			} catch (err) {
				console.error("Transaction failed:", err);
				toast.error("Transaction failed.");
			} finally {
				setLoadingToken(false);
			}
		},
	});

	const isBusy = loadingMeta || loadingFile || loadingToken;

	return (
		<form onSubmit={formik.handleSubmit}>
			<Box
				sx={{
					display: "flex",
					height: "calc(100vh - 64px)",
					width: "100vw",
				}}
			>
				<Box
					sx={{
						width: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#F5F5F5",
						position: "relative",
					}}
				>
					{loadingMeta || loadingFile ? (
						<CircularProgress />
					) : previewUrl ? (
						<iframe
							src={previewUrl}
							title="PDF Preview"
							style={{
								width: "100%",
								height: "100%",
								border: "4px solid #121e3c",
								cursor: "pointer",
							}}
							scrolling="no"
						/>
					) : (
						<Typography
							variant="body2"
							sx={{
								border: "2px dashed #092147",
								borderRadius: 2,
								padding: 4,
								width: "90%",
								height: "90%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#555",
								textAlign: "center",
								fontSize: "18px",
							}}
						>
							{fileMeta
								? "No preview available."
								: "Loading metadata..."}
						</Typography>
					)}
				</Box>

				<Box
					sx={{
						width: "50%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "flex-start",
						gap: 2,
						backgroundColor: "#ffffff",
						paddingX: 8,
					}}
				>
					<Typography variant="h2" sx={{ fontSize: "30px" }}>
						Grant access
					</Typography>

					<Divider
						sx={{
							backgroundColor: "#FFFFFF",
							height: "1px",
							width: "100%",
							mb: 2,
						}}
					/>

					<TextField
						fullWidth
						label="File Name"
						value={fileMeta?.name || ""}
						InputProps={{ readOnly: true }}
						disabled={isBusy}
					/>

					<TextField
						fullWidth
						label="Wallet Address"
						name="wallet"
						value={formik.values.wallet}
						onChange={formik.handleChange}
						error={
							formik.touched.wallet &&
							Boolean(formik.errors.wallet)
						}
						helperText={
							formik.touched.wallet && formik.errors.wallet
						}
						disabled={isBusy}
					/>

					<TextField
						fullWidth
						select
						label="Access Duration (minutes)"
						name="duration"
						value={formik.values.duration}
						onChange={formik.handleChange}
						error={
							formik.touched.duration &&
							Boolean(formik.errors.duration)
						}
						helperText={
							formik.touched.duration && formik.errors.duration
						}
						disabled={isBusy}
					>
						{[5, 10, 15, 30, 60].map((value) => (
							<MenuItem key={value} value={value}>
								{value} minutes
							</MenuItem>
						))}
					</TextField>

					<Button
						type="submit"
						variant="contained"
						color="primary"
						sx={{
							width: "100%",
							height: "auto",
							position: "relative",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 1,
						}}
						disabled={!fileMeta || isBusy}
					>
						{loadingToken && (
							<CircularProgress
								size={24}
								sx={{ color: "white" }}
							/>
						)}
						{loadingToken
							? "Generating access token..."
							: "Generate access token"}
					</Button>

					<TextField
						fullWidth
						label="Access token"
						value={accessToken}
						InputProps={{ readOnly: true }}
					/>
				</Box>
			</Box>
		</form>
	);
}
