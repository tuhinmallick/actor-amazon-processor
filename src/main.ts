import { Actor } from "apify";
import { getCheapestOffersFromDataset } from "./utils.js";
import { Input } from "./types.js";

await Actor.init();

const input = await Actor.getInput<Input>();
if (!input) throw new Error("Input is missing!");
const { datasetId } = input;

await getCheapestOffersFromDataset(datasetId);

await Actor.exit();
