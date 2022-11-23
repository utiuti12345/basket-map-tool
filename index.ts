import {convertToAddress, convertToCourtType, convertToModel} from "./domain/models/park";
import {readFile} from "./libs/csv/csv";
import * as CitiesRepository from "./domain/repositories/cities";
import {beforeGetCities} from "./utils/utils";
import * as ParksRepository from "./domain/repositories/parks";
import * as ParkHoopsRepository from "./domain/repositories/parkHoops";

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

async function main() {
    const data = readFile("/Users/saotome/Desktop/basket-map-for-web/tsv/考えるバスケットの会.com/court-chiba.csv");

    const parks = await convertToModel(data);
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

