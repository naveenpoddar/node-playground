import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { FitAddon } from "xterm-addon-fit";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store";
import { Section } from "react-simple-resizer";

function TerminalComponent() {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { io } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    if (!terminalRef.current) {
      const TerminalElement = document.querySelector("#term") as HTMLElement;
      const TerminalWrapper = document.querySelector(
        ".terminal-wrapper"
      ) as HTMLElement;

      const term = new Terminal({
        theme: {
          background: "#181818",
        },
      });
      fitAddonRef.current = new FitAddon();
      terminalRef.current = term;
      term.loadAddon(fitAddonRef.current);
      term.open(TerminalElement);
      fitAddonRef.current.fit();
    }
  }, []);

  const fitTerminal = () => {
    if (!fitAddonRef.current) return;
    const dimentions = fitAddonRef.current.proposeDimensions();
    if (
      Number.isInteger(dimentions.cols) ||
      Number.isInteger(dimentions.rows)
    ) {
      fitAddonRef.current.fit();
    }
  };

  useEffect(() => {
    if (!io || !terminalRef.current) return;

    io?.on("terminal:data", (stream: any) => {
      terminalRef.current?.write(stream);
    });

    terminalRef.current?.onData((data) => {
      io?.emit("terminal:data-write", data);
    });

    io.on("scripts:install", (script: string) => {
      terminalRef.current?.write(`${script}\n`);
      io?.emit("terminal:data-write", `${script}\n`);
    });
  }, [io]);

  return (
    <Section defaultSize={180} onSizeChanged={fitTerminal}>
      <div id="term"></div>
    </Section>
  );
}

export default TerminalComponent;
