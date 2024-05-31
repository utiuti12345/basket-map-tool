import {convertToAddress, convertToCourtType, convertToModel} from "./domain/models/park";
import {readFile} from "./libs/csv/csv";
import * as CitiesRepository from "./domain/repositories/cities";
import {beforeGetCities} from "./utils/utils";
import * as ParksRepository from "./domain/repositories/parks";
import * as ParkHoopsRepository from "./domain/repositories/parkHoops";
import {addressConvertToGeocode} from "./libs/geo/geocode";
import {uploadByte} from "./libs/storage/storage";
import axios from "axios";

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
// geoCording();

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
    const data = readFile("/Users/saotome/Desktop/basket-map-for-web/tsv/temp_address2.csv");
    const parks = await convertToModel(data,27);

    let count = 1;
    await Promise.all(parks.map(async it => {
        const searchParks = await ParksRepository.searchByParkName(it.park.park_name);
        if (searchParks.length == 0) {
            try{
                const id = await ParksRepository.insert(it.park);
                it.park.park_id = id;
                if (it.parkHoop !== null && it.parkHoop !== undefined && it.parkHoop.length != 0) {
                    var count = 1;
                    it.parkHoop.map(async it => {
                        it.hoop_id = count;
                        it.park_id = id;
                        await ParkHoopsRepository.insertParkHoops(it);
                        count++;
                    });
                }
                if (it.imageUrl !== null && it.imageUrl !== undefined && it.imageUrl.length != 0) {
                    try{
                        const res = await axios.get(it.imageUrl, {responseType: 'arraybuffer'});
                        const arrayBuffer = res.data;
                        const buffer = Buffer.from(arrayBuffer);
                        await uploadByte(buffer, `park-${it.park.park_id}-1.png`);
                        await ParksRepository.update({
                            ...it.park,
                            image_url: `park-${it.park.park_id}-1.png`
                        });
                    }catch (e) {
                        console.log(e);

                        console.log(`画像のアップロードに失敗しました:${it.park.park_id}`);
                        console.log(`${it.park.park_id}`);
                        console.log(`${it.park.park_name}`);
                        console.log(`${it.imageUrl}`);

                    }
                }

                console.log(`${it.park.park_name}:${id}`)
            }
            catch(e){
                console.log(e);
            }
        } else {
            console.log(`${it.park.park_name}は既に公園の登録があります`);
        }
    }));
}

