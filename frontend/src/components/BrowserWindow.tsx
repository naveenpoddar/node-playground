import dynamic from "next/dynamic";
import React, { useEffect, useRef } from "react";
import { HiRefresh } from "react-icons/hi";
import { IoMdOpen } from "react-icons/io";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store";

const ResizePanel = dynamic(() => import("@alexkreidler/react-resize-panel"), {
  ssr: false,
});

const BrowserWindow = () => {
  const { containerUrl, io } = useSelector((state: RootState) => state.app);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reloadIframe = () => {
    try {
      if (!iframeRef.current) return;
      let tempSrc = iframeRef.current.src;
      iframeRef.current.src = "";
      iframeRef.current.src = tempSrc;
    } catch (err) {
      console.log("Iframe Error", err);
    }
  };

  const openWindow = () => {
    if (typeof window !== "undefined") {
      return window.open(containerUrl);
    }
  };

  useEffect(() => {
    io?.on("start-webserver", () => {
      reloadIframe();
    });
  }, []);

  return (
    <ResizePanel
      direction="w"
      containerClass="panel-container"
      borderClass="dragger"
    >
      <div className="browser-window-wrapper">
        <div className="window-head">
          <HiRefresh onClick={reloadIframe} />
          <input
            type="text"
            className="url-container"
            disabled
            value={containerUrl}
          />
          <IoMdOpen onClick={openWindow} />
        </div>

        <div className="window-body">
          <iframe
            src={containerUrl}
            ref={iframeRef}
            sandbox="allow-scripts allow-popups allow-forms allow-modals allow-orientation-lock allow-pointer-lock"
          ></iframe>
        </div>
      </div>
    </ResizePanel>
  );
};

export default BrowserWindow;
