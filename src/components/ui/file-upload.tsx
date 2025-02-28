/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import model from "@/lib/ai";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { marked } from "marked";
import { MdAddAPhoto, MdClose, MdImage, MdUploadFile } from "react-icons/md";
import { toast } from "sonner";

export const SummarizeDropzone = ({
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

export const PostPhotoDropzone = ({
  onChange,
  setFiles,
}: {
  onChange?: (files: File[]) => void;
  setFiles: Dispatch<SetStateAction<{ file: File; url: string }[]>>;
}) => {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length === 0) {
      toast("Only image files are allowed.");
      return;
    }

    if (validFiles.length >= 3) {
      toast("Only 3 images are allowed.");
      return;
    }

    if (previews.length > 3) {
      toast("Only 3 images are allowed.");
      return;
    }

    // Create preview URLs for new files
    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    // Update state and notify parent
    setPreviews((prev) => [...prev, ...newPreviews]);
    setFiles([...previews, ...newPreviews]);
    onChange && onChange([...previews.map((p) => p.file), ...validFiles]);
  };

  const removeImage = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    onChange && onChange(updatedPreviews.map((p) => p.file));
  };

  const handleClick = () => fileInputRef.current?.click();

  const { getRootProps } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop: handleFileChange,
  });

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
      />
      <div className="w-full" {...getRootProps()}>
        {previews.length == 0 && (
          <motion.div
            onClick={handleClick}
            className="p-6 border border-dashed border-stone-300 dark:border-stone-700 rounded-lg cursor-pointer flex flex-col items-center justify-center"
          >
            <MdImage size={32} className="text-gray-500 dark:text-gray-400" />
            <p className="text-gray-400 dark:text-gray-400 text-sm">
              Drag or drop images here or click to upload
            </p>
          </motion.div>
        )}

        {previews.length > 0 && (
          <div className="flex flex-row gap-2 overscroll-x-auto">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview.url}
                  alt={`Selected ${index + 1}`}
                  className="w-36 h-36 aspect-auto object-cover rounded-md"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <MdClose size={18} />
                </button>
              </div>
            ))}
            {previews.length < 3 && (
              <button
                className="self-center dark:bg-stone-700 hover:dark:bg-stone-600 p-3 rounded-full"
                type="button"
                onClick={handleClick}
              >
                <MdAddAPhoto size={36} className="flex-shrink-0" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
