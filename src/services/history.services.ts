import { IHistory } from "@/interfaces";
import { Dispatch, SetStateAction } from "react";

const clearHistory = (setHistory: Dispatch<SetStateAction<IHistory[]>>) =>
  setHistory([]);

export { clearHistory };
