import supabase from "./libs/supabase/supabase";
import {convertToAddress} from "./domain/models/park";
import {readFile} from "./libs/csv/csv";

require('dotenv').config();

// supabase.from('prefecture').select()
//     .then(data => console.log(data))
// supabase.storage.from('parks.images').list('',{limit: 1000})
//     .then((res) =>{
//         res.data?.map(it =>
//             console.log(it.name)
//         )
//     })

const data = readFile("");

data.map((item:any) => {
    convertToAddress(data[3][5])
})
