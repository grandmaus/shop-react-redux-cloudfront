import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const { refetch } = useQuery<string, AxiosError>(
    "signedUrl",
    async () => {
      const authorization_token = localStorage.getItem("authorization_token");
      console.log("authorization_token", authorization_token);
      const res = await axios.get<{ signedUrl: string }>(url, {
        params: {
          fileName: encodeURIComponent(String(file?.name)),
        },
        headers: !!authorization_token
          ? {
              Authorization: `Basic ${authorization_token}`,
            }
          : undefined,
      });
      return res.data?.signedUrl;
    },
    {
      enabled: false,
    }
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url, file);
    const { data: signedUrl, isSuccess } = await refetch();

    if (isSuccess) {
      const result = await fetch(signedUrl, {
        method: "PUT",
        body: file,
      });
      console.log("Result: ", result);
      setFile(undefined);
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
