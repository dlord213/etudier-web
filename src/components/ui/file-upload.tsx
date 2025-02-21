/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import model from "@/lib/ai";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { marked } from "marked";

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: summary ? marked(summary) : "",
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && summary) {
      editor.commands.setContent(marked(summary));
    }
  }, [summary, editor]);

  // Helper function: read a file as Base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove the prefix ("data:application/pdf;base64,") to get just the Base64 data
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Summarize the PDF using the Google Generative AI model
  const handleSummarizeFile = async (file: File) => {
    setSummarizing(true);
    try {
      const base64Data = await readFileAsBase64(file);
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf",
          },
        },
        "Summarize this document",
      ]);
      const summaryText = result.response.text();
      setSummary(summaryText);
    } catch (error) {
      console.error("Error summarizing file:", error);
      setSummary("Failed to summarize the document.");
    } finally {
      setSummarizing(false);
    }
  };

  // Called when files are dropped or selected
  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);

    // Automatically summarize the file if it is a PDF
    if (newFiles.length > 0) {
      const file = newFiles[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        handleSummarizeFile(file);
      } else {
        setSummary("Only PDF files can be summarized.");
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {},
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden border border-dashed border-stone-300 dark:border-stone-700"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          accept=".pdf"
        />
        <div className="flex flex-col items-center justify-center gap-4">
          <IconUpload size={24} />
          <p className="relative z-20 font-sans font-normal text-zinc-400 dark:text-zinc-400 text-base">
            Drag or drop your documents here or click to upload
          </p>
        </div>
      </motion.div>
      {summarizing && (
        <p className="mt-4 text-stone-500">
          Summarizing document, please wait...
        </p>
      )}
      {summary && (
        <div className="mt-4 p-4 rounded-md bg-stone-100 dark:bg-stone-700">
          <h3 className="font-bold mb-2 lg:text-2xl dark:text-stone-200">
            Summary
          </h3>
          <EditorContent
            editor={editor}
            className="dark:text-stone-300 whitespace-pre-wrap"
          />
        </div>
      )}
    </div>
  );
};
