import { useFormik } from "formik";
import * as yup from "yup";
import { Box, Button, CircularProgress, Divider, TextField, Typography } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { encryptAndPinFile } from "../services/pinata-service";

const validationSchema = yup.object({
	file: yup.mixed().required("File is required"),
	fileName: yup.string().required("File name is required"),
});

export default function FileUpload() {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const formik = useFormik({
		initialValues: {
			file: undefined as File | undefined,
			fileName: "",
		},
		validationSchema,
		onSubmit: async (values, { resetForm }) => {
			if (!values.file) return;
			setLoading(true);

			try {
				const { cid, symmetricKeyHex, ivHex } = await encryptAndPinFile(
					values.file
				);
				console.log("File pinned, CID =", cid);

				resetForm();
				setFile(null);
				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
					setPreviewUrl(null);
				}
			} catch (err) {
				console.error("Transaction failed:", err);
				toast.error("Transaction error occurred.");
			} finally {
				setLoading(false);
			}
		},
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (!selectedFile) return;

		formik.setFieldValue("file", selectedFile);
		formik.setFieldValue("fileName", selectedFile.name);
		setFile(selectedFile);

		const url = URL.createObjectURL(selectedFile);
		setPreviewUrl(url);
	};

	const handlePreviewClick = () => {
		inputRef.current?.click();
	};

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

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
					}}
					onClick={handlePreviewClick}
				>
					{previewUrl ? (
						file?.type === "application/pdf" ? (
							<iframe
								src={previewUrl}
								title="PDF Preview"
								style={{
									width: "100%",
									height: "100%",
									border: "2px solid #092147",
									cursor: "pointer",
								}}
							/>
						) : (
							<img
								src={previewUrl}
								alt="Preview"
								style={{
									width: "200px",
									height: "200px",
									objectFit: "cover",
									border: "5px solid #092147",
									borderRadius: "8px",
									cursor: "pointer",
								}}
							/>
						)
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
								cursor: "pointer",
								fontSize: "18px",
							}}
						>
							Click here to upload a file
						</Typography>
					)}
					<input
						type="file"
						hidden
						ref={inputRef}
						onChange={handleFileChange}
						accept="image/*,application/pdf"
					/>
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
						Upload file
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
						name="fileName"
						value={formik.values.fileName}
						onChange={formik.handleChange}
						error={
							formik.touched.fileName &&
							Boolean(formik.errors.fileName)
						}
						helperText={
							formik.touched.fileName && formik.errors.fileName
						}
					/>

					{formik.touched.file && formik.errors.file && (
						<Typography sx={{ fontSize: 12, color: "#DD3636" }}>
							{formik.errors.file}
						</Typography>
					)}

					<Button
					    disabled={loading || !formik.values.file}
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
					>
						{loading && (
							<CircularProgress
								size={24}
								sx={{ color: "white" }}
							/>
						)}
						{loading
							? "Encrypting and uploading..."
							: "Encrypt & Upload"}
					</Button>
				</Box>
			</Box>
		</form>
	);
}
