import Browser from "../models/Browser.model";
import Playground from "../models/Playground.model";

export default async function checkPlayground(
  playgroundId: string,
  browserId: string
) {
  const playground = await Playground.findOne({ playgroundId });
  if (!playground) return;

  const browser = await Browser.findOne({
    id: browserId,
  }).lean();
  if (!browser) return;

  const playgroundExsistsInBrowser = browser.playgrounds.find(
    (pid) => pid?.toString() === playground._id.toString()
  );
  if (!playgroundExsistsInBrowser) return;

  return playground;
}
