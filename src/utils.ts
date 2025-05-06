import { Dataset } from "apify";
import { Offer } from "./types.js";
import axios from "axios";
import { Actor } from "apify";

export const formatPricingToNum = (price: string) => {
    const priceNum = Number(price.split("$")[1]);
    return priceNum;
};

export const getCheapestOffers = (offers: Offer[]) => {
    const cheapestOffers = offers.reduce(
        (accObj: Record<string, Offer>, offerObj: Offer) => {
            if (offerObj.offer === "") {
                return accObj;
            }

            const offerPriceNum = formatPricingToNum(offerObj.offer);
            const offerAsin = offerObj.asin;

            if (accObj.hasOwnProperty(offerAsin)) {
                const existingPrice = formatPricingToNum(
                    accObj[offerAsin].offer,
                );
                if (offerPriceNum < existingPrice) {
                    accObj[offerAsin] = offerObj;
                }
            } else {
                accObj[offerAsin] = offerObj;
            }

            return accObj;
        },
        {},
    );

    return Object.values(cheapestOffers);
};

export const getDatasetItems = async (datasetId: string): Promise<Offer[]> => {
    const endpoint = `https://api.apify.com/v2/datasets/:${datasetId}/items`;
    try {
        const response = await axios.get<Offer[]>(endpoint);
        return response.data;
    } catch (error) {
        throw new Error(
            `Encountered an error during API call in getDatasetFromId function: ${error}`,
        );
    }
};

export const getCheapestOffersFromDataset = async (
    datasetId: string,
): Promise<void | undefined> => {
    try {
        const allOffers = await getDatasetItems(datasetId);

        if (allOffers.length === 0 || !Array.isArray(allOffers)) {
            console.error(
                `Fetched the items from the datasetId: ${datasetId}, but it is empty or the returned answer is not array`,
            );
            return;
        }

        const cheapestOffers = getCheapestOffers(allOffers);

        await Actor.pushData(cheapestOffers);
    } catch (e) {
        throw new Error(
            `Error in general getCheapestOffersFromDataset function: ${e}`,
        );
    }
};
