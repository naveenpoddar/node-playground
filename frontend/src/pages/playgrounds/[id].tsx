import React, { useEffect, useState } from "react";
import AppEditor from "../../components/AppEditor";
import Panel from "../../components/Panel";
import BrowserWindow from "../../components/BrowserWindow";
import dynamic from "next/dynamic";
import { initilizeSocket, openFile, updateAppState } from "../../reducers/app";
import { useDispatch, useSelector } from "react-redux";
import { GetServerSideProps } from "next";
import { getBrowserId } from "../../lib/util";
import { Container, Section, Bar } from "react-simple-resizer";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";
import Link from "next/link";
import { RootState } from "../../lib/store";

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
  const { fileContentsVisible } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    d(initilizeSocket({ playgroundId, browserId: getBrowserId() }));
  }, []);

  return (
    <main>
      <Container className="playground">
        <div className="panel-left">
          <Link href="/">
            <div className="logo">NP</div>
          </Link>

          <div className="items">
            <div
              className={`item ${fileContentsVisible ? "active" : ""}`}
              onClick={() =>
                d(updateAppState({ fileContentsVisible: !fileContentsVisible }))
              }
            >
              <HiOutlineDocumentDuplicate />
            </div>
          </div>
        </div>

        <Section className="file-contents" defaultSize={180}>
          {fileContentsVisible && <Panel />}
        </Section>
        <Bar size={5} style={{ background: "#2a2a2a", cursor: "col-resize" }} />
        <Section className="dev-area" defaultSize={500}>
          <Container className="dev-area-wrapper" vertical>
            <Section defaultSize={500}>
              <AppEditor />
            </Section>
            <Bar
              size={5}
              style={{ background: "#2a2a2a", cursor: "n-resize" }}
            />

            <AppTerminal />
          </Container>
        </Section>
        <Bar size={5} style={{ background: "#2a2a2a", cursor: "col-resize" }} />
        <Section defaultSize={280}>
          <BrowserWindow />
        </Section>
      </Container>
    </main>
  );
};

export default Playground;
