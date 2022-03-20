import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { FitAddon } from "xterm-addon-fit";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store";

function TerminalComponent() {
  const terminalRef = useRef<Terminal | null>(null);
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
      const fitAddon = new FitAddon();
      terminalRef.current = term;
      term.loadAddon(fitAddon);
      term.open(TerminalElement);
      if (typeof window !== "undefined") {
        const observer = new ResizeObserver(() => fitAddon.fit());
        observer.observe(TerminalWrapper.parentElement as HTMLElement);
      }
    }
  }, []);

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

  return <div id="term"></div>;
}

export default TerminalComponent;
