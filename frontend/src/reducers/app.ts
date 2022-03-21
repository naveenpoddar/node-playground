import { AnyAction, Dispatch, Reducer } from "redux";
import { io } from "socket.io-client";
import { WS_URI } from "../config";
import axios from "../lib/axios";
import containerInstance from "../lib/containerInstance";
import { File } from "../types/File";
import { Tab } from "../types/Tab";
import { getContainerId } from "../lib/util";

export const APP_STATE_UPDATE = "APP_STATE_UPDATE";
export const APP_STATE_OPEN_FILE = "APP_STATE_OPEN_FILE";
export const APP_STATE_CODE_UPDATE = "APP_STATE_CODE_UPDATE";
export const APP_STATE_CLOSE_TAB = "APP_STATE_CLOSE_TAB";

export interface AppState {
  code: string;
  temporaryCode: string;
  files: File[];
  currentFile: File | null;
  currentTabIndex?: number;
  tabs: Tab[];

  playgroundLoading: boolean;
  containerUrl?: string;
  containerIP?: string;
  io: ReturnType<typeof io> | null;

  fileContentsVisible: boolean;
  terminalVisible: boolean;
}

interface AppDispatch {
  type: string;
  payload?: any;
}

type AppAction<T = void> = (
  params: T
) => (dispatch: Dispatch<AppDispatch>) => Promise<any>;

const initialAppState: AppState = {
  code: "",
  temporaryCode: "",
  files: [],
  currentFile: null,
  tabs: [],
  io: null,

  playgroundLoading: true,
  fileContentsVisible: true,
  terminalVisible: true,
};

const appReducer: Reducer<AppState, AnyAction> = (
  state = initialAppState,
  { type, payload }
) => {
  switch (type) {
    case APP_STATE_UPDATE:
      return { ...state, ...payload };

    case APP_STATE_OPEN_FILE:
      const fileIsInTabs = state.tabs.find(
        (tab) => tab.path === payload.file.path
      );
      const fileIsCurrentlyOpen =
        state.currentFile && state.currentFile.path === payload.file.path;

      if (fileIsCurrentlyOpen && fileIsInTabs) {
        // The file is already open so ignoring it
        return state;
      }

      if (fileIsInTabs) {
        // The File is already open in one of the tabs so opening it in the current tab
        return {
          ...state,
          currentFile: payload.file,
          code: payload.code,
          temporaryCode: payload.code,
        };
      }

      return {
        ...state,
        currentFile: payload.file,
        code: payload.code,
        temporaryCode: payload.code,
        tabs: [...state.tabs, payload.file],
        currentTabIndex: state.tabs.length,
      };

    case APP_STATE_CODE_UPDATE:
      return {
        ...state,
        code: payload.code,
        tabs: state.tabs.map((tab) => {
          if (tab.path === payload.file.path) {
            return { ...tab, code: payload.code };
          }
          return tab;
        }),
        hasChanges: state.temporaryCode !== state.code,
      };

    case APP_STATE_CLOSE_TAB:
      return {
        ...state,
        tabs: state.tabs.filter((tab) => tab.path !== payload.path),
        currentFile: null,
        code: "",
        temporaryCode: "",
        currentTabIndex: null,
      };

    default:
      return state;
  }
};

export const updateAppState: AppAction<Partial<AppState>> =
  (obj) => async (dispatch) => {
    dispatch({
      type: APP_STATE_UPDATE,
      payload: obj,
    });
  };

export const initApp: AppAction = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/", {
      params: {
        browserId: localStorage.getItem("browserId"),
      },
    });
    localStorage.setItem("browserId", data);
  } catch (e) {}
};

export const initilizeSocket: AppAction<{ [key: string]: string }> =
  (query) => async (dispatch) => {
    const socket = io(WS_URI, {
      transports: ["websocket"],
      query,
    });

    socket.on(
      "playground-info",
      (data: { url: string; containerIP: string; containerId: string }) => {
        localStorage.setItem("containerId", data.containerId);
        localStorage.setItem("containerIP", data.containerIP);

        dispatch({
          type: APP_STATE_UPDATE,
          payload: {
            io: socket,
            containerUrl: data.url,
            containerIP: data.containerIP,
            playgroundLoading: false,
          },
        });
      }
    );
  };

export const openFile: AppAction<{ file: File; containerIP: string }> =
  ({ file }) =>
  async (dispatch) => {
    try {
      const { data } = await containerInstance(getContainerId()).get(`/file`, {
        params: {
          path: file.path,
        },
      });

      dispatch({
        type: APP_STATE_OPEN_FILE,
        payload: {
          code: data.content, // i didnt change it here
          file: {
            ...file,
            code: data.content,
            // i was changing it here and was wondering why not working
          },
        },
      });
    } catch (e) {}
  };

export const openTab: AppAction<Tab> = (file) => async (dispatch) => {
  dispatch({
    type: APP_STATE_UPDATE,
    payload: {
      code: file.code,
      temporaryCode: file.code,
      currentFile: file,
      file: file,
    },
  });
};

export const saveFile: AppAction<{
  file: File;
  code: string;
  socket: ReturnType<typeof io>;
}> =
  ({ file, code, socket }) =>
  async (dispatch) => {
    socket.emit("file-save", {
      path: file.path,
      code,
    });

    dispatch({
      type: APP_STATE_UPDATE,
      payload: {
        temporaryCode: code,
        code,
      },
    });
  };

export const closeFile: AppAction = () => async (dispatch) => {
  dispatch({
    type: APP_STATE_UPDATE,
    payload: {
      temporaryCode: "",
      code: "",
      currentFile: null,
    },
  });
};

export const setCode: AppAction<{ file: File; code?: string }> =
  ({ file, code }) =>
  async (dispatch) => {
    dispatch({
      type: APP_STATE_CODE_UPDATE,
      payload: {
        code,
        file,
      },
    });
  };

export const setFiles: AppAction<File[]> = (files) => async (dispatch) => {
  dispatch({
    type: APP_STATE_UPDATE,
    payload: { files },
  });
};

export const closeTab: AppAction<Tab> = (tab) => async (dispatch) => {
  dispatch({
    type: APP_STATE_CLOSE_TAB,
    payload: tab,
  });
};

export default appReducer;
