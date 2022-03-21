import React, { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { RootState } from "../lib/store";
import { useDispatch, useSelector } from "react-redux";
import {
  setCode,
  closeFile,
  saveFile,
  openFile,
  openTab,
  closeTab,
} from "../reducers/app";
import { AiOutlineSave } from "react-icons/ai";
import Loading from "./Loading";

const fileTypes: { [ex: string]: string } = {
  css: "css",
  js: "javascript",
  json: "json",
  md: "markdown",
  mjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  html: "html",
  htm: "html",
  svg: "svg",
  xml: "xml",
  jsx: "javascript",
};

const AppEditor = () => {
  const d = useDispatch();
  const {
    code,
    currentFile,
    io,
    tabs,
    temporaryCode,
    currentTabIndex,
    playgroundLoading,
  } = useSelector((state: RootState) => state.app);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { current: editor } = editorRef;

  const handleEditorMount: OnMount = (editor) => {
    editor.focus();
    editorRef.current = editor;
  };

  const saveCurrentFile = (e?: any) => {
    if (!currentFile || !io || !editor) return;
    if (e) e.preventDefault();
    d(saveFile({ file: currentFile, code: editor.getValue(), socket: io }));
  };

  // when (ctrl + w) is pressed close the current tab
  const isBrowser = typeof window !== "undefined";

  function closeCurrentFile(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "w") {
      e.preventDefault();
      const currentTab = tabs[currentTabIndex!];
      if (!currentTab) return;
      d(closeTab(currentTab));
    }
  }

  useEffect(() => {
    if (isBrowser) {
      window.addEventListener("keydown", closeCurrentFile);
      return () => window.removeEventListener("keydown", closeCurrentFile);
    }
  }, []);

  useEffect(() => {
    if (code !== temporaryCode) {
      const timeout = setTimeout(() => {
        saveCurrentFile();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [code]);

  const closeButtonHandler = (tab: any) => () => {
    d(closeTab(tab));
  };

  const fileExtention = currentFile ? currentFile.name.split(".")[1] : "md";

  return (
    <div className="app-editor">
      <div className="editor-header app-scroll app-scroll-x">
        {tabs.map((tab) => (
          <div
            className={`file-head ${
              currentFile?.path === tab.path ? "active" : ""
            }`}
            onClick={() => d(openTab(tab))}
            key={tab.path}
          >
            <span className="name">{tab.name}</span>
            {tab.hasChanges ? (
              <AiOutlineSave
                className="save-reminder"
                onClick={saveCurrentFile}
              />
            ) : (
              <button className="close-btn" onClick={closeButtonHandler(tab)}>
                ⤬
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="main-editor">
        {currentFile && tabs.length !== 0 && (
          <Editor
            theme="vs-dark"
            options={{
              selectOnLineNumbers: true,
            }}
            language={fileTypes[fileExtention] || "markdown"}
            onMount={handleEditorMount}
            loading={<div className="editor-load"></div>}
            value={code}
            onChange={(val) => d(setCode({ code: val, file: currentFile }))}
          />
        )}
      </div>
    </div>
  );
};

export default AppEditor;
