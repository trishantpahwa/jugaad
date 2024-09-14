import figlet from "figlet";
import { Dispatch, SetStateAction } from "react";

export function generateTextArt(
  setTextArt: Dispatch<SetStateAction<string | undefined>>
) {
  return figlet.text("Jugaad", (err, data) => {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    setTextArt(data);
  });
}
