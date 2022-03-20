import React, { useEffect } from "react";
import AppEditor from "../../components/AppEditor";
import Panel from "../../components/Panel";
import BrowserWindow from "../../components/BrowserWindow";
import dynamic from "next/dynamic";
import { initilizeSocket } from "../../reducers/app";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getBrowserId } from "../../lib/util";

const AppTerminal = dynamic(() => import("../../components/AppTerminal"), {
  ssr: false,
});
const ResizePanel = dynamic(() => import("@alexkreidler/react-resize-panel"), {
  ssr: false,
});

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id: playgroundId } = ctx.query;

  return {
    props: { playgroundId },
  };
};

const Playground = ({ playgroundId }: { playgroundId: string }) => {
  const d = useDispatch();

  useEffect(() => {
    d(initilizeSocket({ playgroundId, browserId: getBrowserId() }));
  }, []);

  return (
    <main>
      <Panel />
      <div className="dev-area">
        <AppEditor />

        <ResizePanel
          direction="n"
          containerClass="terminal-container"
          borderClass="dragger y"
        >
          <div className="terminal-wrapper">
            <AppTerminal />
          </div>
        </ResizePanel>
      </div>
      <BrowserWindow />
    </main>
  );
};

export default Playground;
