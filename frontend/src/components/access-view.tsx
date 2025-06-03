import { useFormik } from "formik";
import * as yup from "yup";
import {
	Box,
	Button,
	TextField,
	Typography,
	CircularProgress,
	Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { FileInfo } from "../domain/file-info";
import { fetchAndDecryptFile } from "../services/pinata-service";
import { accessFile } from "../services/sapphire-service";

const validationSchema = yup.object({
	token: yup.string().required("Access token is required"),
});

export default function AccessView() {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [fileMeta, setFileMeta] = useState<FileInfo>();
	const [loadingMeta, setLoadingMeta] = useState<boolean>(false);
	const [loadingFile, setLoadingFile] = useState<boolean>(false);

	useEffect(() => {
		if (!fileMeta) return;

		setLoadingFile(true);
		let objectUrl: string | null = null;

		fetchAndDecryptFile(fileMeta.cid, fileMeta.key, fileMeta.iv)
			.then((blob) => {
				objectUrl = URL.createObjectURL(blob);
				setPreviewUrl(objectUrl);
			})
			.catch((err) => {
				console.error("Error fetching/decrypting file:", err);
				toast.error(
					"There was an error fetching or decrypting the file."
				);
			})
			.finally(() => {
				setLoadingFile(false);
			});

		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [fileMeta]);

	const formik = useFormik({
		initialValues: {
			token: "",
		},
		validationSchema,
		onSubmit: async (values) => {
			setLoadingMeta(true);
			try {
				const file = await accessFile(values.token);
				setFileMeta(file);
				toast.success("File fetched.");
			} catch (err) {
				console.log("Transaction failed:", err);
				toast.error("Transaction failed.");
			} finally {
				setLoadingMeta(false);
			}
		},
	});

	const isBusy = loadingMeta || loadingFile;

	return (
		<form onSubmit={formik.handleSubmit}>
			<Box sx={{ display: "flex", height: "calc(100vh - 64px)", width: "100vw" }}>
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
								cursor: "default",
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
								fontSize: "18px"
							}}
						>
							{fileMeta
								? "Loading preview…"
								: "Insert access token"}
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
						Access file
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
						label="Access Token"
						name="token"
						value={formik.values.token}
						onChange={formik.handleChange}
						error={
							formik.touched.token && Boolean(formik.errors.token)
						}
						helperText={formik.touched.token && formik.errors.token}
						disabled={isBusy}
					/>

					<TextField
						fullWidth
						label="File Name"
						value={fileMeta?.name || ""}
						InputProps={{ readOnly: true }}
						disabled
					/>

					<Button
						type="submit"
						variant="contained"
						color="primary"
						sx={{ width: "100%", mt: 2, position: "relative" }}
						disabled={isBusy}
					>
						{loadingMeta && (
        					<CircularProgress size={24} sx={{ color: "white" }} />
            			)}
            			{loadingMeta ? "Veriying token..." : "Verify Token"}
					</Button>
				</Box>
			</Box>
		</form>
	);
}
