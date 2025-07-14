import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./StaticPageEditor.css"; 

const StaticPageEditor = ({ type, label }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`https://landing-page-backend-alpha.vercel.app/api/staticpage/get/${type}`)
      .then((res) => res.json())
      .then((data) => setContent(data.content || ""))
      .catch((err) => {
        console.error("Error fetching content:", err);
        alert("Failed to load content");
      });
  }, [type]);

  const handleSave = () => {
    fetch(`https://landing-page-backend-alpha.vercel.app/api/staticpage/create/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then(() => alert(`${label} saved successfully!`))
      .catch((err) => {
        console.error("Error saving content:", err);
        alert("Failed to save");
      });
  };

  return (
    <div className="static-page-editor-container">
      <h2 className="static-page-heading text-gradient">{label}</h2>
      <CKEditor
        editor={ClassicEditor}
        data={content}
        config={{ licenseKey: "" }}
        onChange={(event, editor) => {
          setContent(editor.getData());
        }}
      />
      <button className="save-button" onClick={handleSave}>
        Save {label}
      </button>
    </div>
  );
};

export default StaticPageEditor;
