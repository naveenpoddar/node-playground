import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../lib/store";
import { openFile, setFiles } from "../reducers/app";
import dynamic from "next/dynamic";
import { BsFillFileEarmarkCodeFill } from "react-icons/bs";
import { FaFolder } from "react-icons/fa";
import { BsFileEarmarkPlusFill } from "react-icons/bs";
import { HiRefresh } from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import { File } from "../types/File";
import Loading from "./Loading";

const ResizePanel = dynamic(() => import("@alexkreidler/react-resize-panel"), {
  ssr: false,
});

const Panel = () => {
  const { files, io, containerIP, playgroundLoading } = useSelector(
    (state: RootState) => state.app
  );
  const d = useDispatch();

  useEffect(() => {
    if (!io) return;

    io.on("files", (files) => {
      d(setFiles(files));
    });

    io.on("start-webserver", () => {
      io?.emit("refresh");
    });
  }, [io]);

  const handleFileOpen: (file: File) => React.MouseEventHandler<HTMLElement> =
    (file: any) => async () => {
      if (!io || !containerIP) return;

      d(openFile({ file, containerIP }));
    };

  const newFile = () => {
    if (!io) return;
    const filename = prompt("Enter filename?");
    if (!filename) return;
    io.emit("new-file", filename);
  };

  return (
    <ResizePanel
      direction="e"
      containerClass="panel-container"
      borderClass="dragger"
    >
      <div className="panel">
        <div className="panel-header">
          <span>Explorer</span>
          <div className="actions">
            <BsFileEarmarkPlusFill onClick={newFile} />
            <HiRefresh onClick={() => io?.emit("refresh")} />
          </div>
        </div>
        <div className="panel-body app-scroll">
          {playgroundLoading && <Loading count={3} />}
          {files.map((file) => (
            <File
              name={file.name}
              key={file.name}
              files={file.files}
              isDir={file.isDirectory}
              path={file.path}
              onClick={handleFileOpen}
            />
          ))}
        </div>
      </div>
    </ResizePanel>
  );
};

const File = (file: {
  name: string;
  onClick: (file: any) => React.MouseEventHandler<HTMLElement>;
  isDir: boolean;
  files?: any[];
  path: string;
}) => {
  const { name, onClick, isDir, files } = file;

  return (
    <details className="file" onClick={isDir ? undefined : onClick(file)}>
      <summary>
        <div className={`file-icon ${isDir ? "directory" : "file"}`}>
          {isDir ? <FaFolder /> : <BsFillFileEarmarkCodeFill />}
        </div>
        <div className="file-name">{name}</div>
      </summary>

      {isDir && (
        <div className="more-files">
          {files?.map((file) => (
            <File
              path={file.path}
              name={file.name}
              key={file.name}
              files={file.files}
              isDir={file.isDirectory}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </details>
  );
};

export default Panel;
