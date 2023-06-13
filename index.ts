import {convertToAddress, convertToCourtType, convertToModel} from "./domain/models/park";
import {readFile} from "./libs/csv/csv";
import * as CitiesRepository from "./domain/repositories/cities";
import {beforeGetCities} from "./utils/utils";
import * as ParksRepository from "./domain/repositories/parks";
import * as ParkHoopsRepository from "./domain/repositories/parkHoops";
import {addressConvertToGeocode} from "./libs/geo/geocode";

require('dotenv').config();

// supabase.from('prefecture').select()
//     .then(data => console.log(data))
// supabase.storage.from('parks.images').list('',{limit: 1000})
//     .then((res) =>{
//         res.data?.map(it =>
//             console.log(it.name)
//         )
//     })

main();
//geoCording();

// アドレスから経度/緯度を求める
// 雑に置いとく
async function geoCording() {
    const data = readFile("/Users/saotome/Desktop/basket-map-for-web/tsv/temp_address.csv");
    data.map(async (item: any) => {
        const geo = await addressConvertToGeocode(item[4]);
        console.log(`${item[0]}\t${geo?.latitude}\t${geo?.longitude}`);
    })
}

async function main() {
    const data = readFile("path_csv");
    const parks = await convertToModel(data,27);

    await Promise.all(parks.map(async it => {
        const searchParks = await ParksRepository.searchByParkName(it.park.park_name);
        if (searchParks.length == 0) {
            const id = await ParksRepository.insert(it.park);
            console.log(it.park_hoop);
            if (it.park_hoop !== null && it.park_hoop !== undefined && it.park_hoop.length != 0) {
                it.park_hoop.map(async it => {
                    await ParkHoopsRepository.insertParkHoops(it);
                });
            }
            console.log(`${it.park.park_name}:${id}`)
        } else {
            console.log(`${it.park.park_name}は既に公園の登録があります`);
        }
    }));
}

