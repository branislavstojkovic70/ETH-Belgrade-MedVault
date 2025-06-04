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
import { useState } from "react";
import toast from "react-hot-toast";

import axios from "axios";

const validationSchema = yup.object({
	token: yup.string().required("Access token is required"),
});

export default function AccessView() {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [loadingMeta, setLoadingMeta] = useState<boolean>(false);
	const [loadingFile, setLoadingFile] = useState<boolean>(false);


	const formik = useFormik({
		initialValues: {
			token: "",
		},
		validationSchema,
		onSubmit: async (values) => {
			setLoadingMeta(true);
			axios.post('http://84.255.245.194:3000/api/files/access', {
				accessToken: values.token,
				authToken: localStorage.getItem("token")
			}, {
				responseType: 'blob'
			})
				.then((response) => {
					const blob = response.data;
					const contentDisposition = response.headers['content-disposition'];
					if (contentDisposition) {
						const match = contentDisposition.match(/filename="(.+)"/);
						if (match && match[1]) {
							setFileName(match[1]);
						}
					}
					const objectUrl = URL.createObjectURL(blob);
					setPreviewUrl(objectUrl);
					setLoadingMeta(false); 
				})
				.catch((err) => {
					console.error("Error fetching/decrypting file:", err);
					toast.error("There was an error fetching or decrypting the file.");
					setLoadingMeta(false); 
				})
				.finally(() => {
					setLoadingFile(false); 
				});
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
							{fileName
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
						value={fileName || ""}
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
