import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FileInfo } from "../domain/file-info";
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	IconButton,
	CircularProgress,
	Divider,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import toast from "react-hot-toast";
import { fetchOwnerFiles } from "../services/sapphire-service";

export default function FileList() {
	const [files, setFiles] = useState<FileInfo[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		setLoading(true);
		fetchOwnerFiles()
			.then((fetched) => setFiles(fetched))
			.catch((err) => {
				console.error("Failed to fetch metadata:", err);
				setFiles([]);
				toast.error("Failed to load files.");
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const truncate = (str: string, prefixLen = 5, suffixLen = 5) => {
		if (str.length <= prefixLen + suffixLen + 3) return str;
		return `${str.slice(0, prefixLen)}...${str.slice(-suffixLen)}`;
	};

	const handleCopy = (value: string) => {
		navigator.clipboard
			.writeText(value)
			.then(() => toast.success("Copied to clipboard"))
			.catch(() => toast.error("Copy failed"));
	};

	if (loading) {
		return (
			<Box
				sx={{
					width: "100%",
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#F5F5F5",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box
			sx={{
				p: 4,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<Box
				sx={{
					display: "flex",
					width: "60%",
					alignItems: "column-start",
					flexDirection: "column",
					gap: 2,
				}}
			>
				<Typography variant="h2" sx={{ fontSize: "30px" }}>
					Files
				</Typography>
				<Divider
					sx={{
						backgroundColor: "#FFFFFF",
						height: "1px",
						width: "100%",
						mb: 2,
					}}
				/>
			</Box>
			<TableContainer
				component={Paper}
				elevation={3}
				sx={{ width: "60%" }}
			>
				<Table sx={{ tableLayout: "auto", width: "100%" }}>
					<TableHead>
						<TableRow>
							<TableCell>
								<Typography
									variant="subtitle1"
									fontWeight="bold"
								>
									Name
								</Typography>
							</TableCell>

							<TableCell>
								<Typography
									variant="subtitle1"
									fontWeight="bold"
								>
									CID
								</Typography>
							</TableCell>

							<TableCell>
								<Typography
									variant="subtitle1"
									fontWeight="bold"
								>
									File ID
								</Typography>
							</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{files.map((file) => {
							const fullName = file.name;
							const fullCid = file.cid;
							const fullId = String(file.fileId);

							return (
								<TableRow
									key={file.fileId}
									hover
									sx={{ cursor: "pointer" }}
									onClick={() =>
										navigate(`/file/${file.fileId}`)
									}
								>
									<TableCell>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
											}}
										>
											<Typography>{fullName}</Typography>
											<IconButton
												size="small"
												onClick={(e) => {
													e.stopPropagation();
													handleCopy(fullName);
												}}
											>
												<ContentCopyIcon fontSize="small" />
											</IconButton>
										</Box>
									</TableCell>

									<TableCell>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
											}}
										>
											<Typography>
												{truncate(fullCid, 5, 5)}
											</Typography>
											<IconButton
												size="small"
												onClick={(e) => {
													e.stopPropagation();
													handleCopy(fullCid);
												}}
											>
												<ContentCopyIcon fontSize="small" />
											</IconButton>
										</Box>
									</TableCell>

									<TableCell>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
											}}
										>
											<Typography>
												{truncate(fullId, 5, 5)}
											</Typography>
											<IconButton
												size="small"
												onClick={(e) => {
													e.stopPropagation();
													handleCopy(fullId);
												}}
											>
												<ContentCopyIcon fontSize="small" />
											</IconButton>
										</Box>
									</TableCell>
								</TableRow>
							);
						})}

						{files.length === 0 && (
							<TableRow>
								<TableCell colSpan={3} align="center">
									<Typography
										variant="body2"
										color="textSecondary"
									>
										No files found.
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
