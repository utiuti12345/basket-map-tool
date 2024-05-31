import {GEOCODE_BASEURL} from "../../constants/constants";
import axios from "axios";

export interface Geometry {
    coordinates: number[];
    type: string;
}

export interface Properties {
    addressCode: string;
    title: string;
}

export interface geoResponse {
    geometry: Geometry;
    type: string;
    properties: Properties;
}

export interface Geo {
    latitude: number,
    longitude: number,
}

export async function addressConvertToGeocode(address: string): Promise<Geo | null> {
    const encodeAddress = encodeURIComponent(address);
    const url = GEOCODE_BASEURL + encodeAddress;

    const res = await axios.get(url);
    const parseData:geoResponse[] = JSON.parse(JSON.stringify(res.data));

    if (parseData.length > 0){
        const longitude = parseData[0].geometry.coordinates[0]
        const latitude = parseData[0].geometry.coordinates[1]

        return {latitude,longitude}
    }
    return null;
}
