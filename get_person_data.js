const request = require('async-request')
const fs = require('fs')

const file_path = "./person_ids_03_20_2020.json"

if(!process.env.TMDB_API_KEY){
    console.log("API KEY Not set\nRun: export TMDB_API_KEY=<keyvalue>")
    process.exit(1)
}
const api_call=`https://api.themoviedb.org/3/person/{{person_id}}?api_key=${process.env.TMDB_API_KEY}&language=en-US&append_to_response=combined_credits`

function get_file_data(){
    let personDB = fs.readFileSync(file_path);
    try{
        personDB = `[${personDB.toString().replace(/}/gi,'},').replace(/\s/gi,"").slice(0,-1)}]`
        personDB = JSON.parse(personDB)
    }catch(e){
        console.error(e)
    }
    // [{"adult":false,"id":16767,"name":"Aki Kaurismäki","popularity":1.003},
    // {"adult":false,"id":54768,"name":"Turo Pajala","popularity":0.6},
    // {"adult":false,"id":54769,"name":"Susanna Haavisto","popularity":0.6},
    // {"adult":false,"id":4826,"name":"Matti Pellonpää","popularity":0.6},
    // {"adult":false,"id":54770,"name":"Eetu Hilkamo","popularity":2.314},
    // {"adult":false,"id":16769,"name":"Timo Salminen","popularity":0.6},
    // {"adult":false,"id":54766,"name":"Raija Talvio","popularity":0.608},
    // {"adult":false,"id":53836,"name":"Risto Karhula","popularity":0.6},
    // {"adult":false,"id":54771,"name":"Tuula Hilkamo","popularity":0.6},
    // {"adult":false,"id":5999,"name":"Kati Outinen","popularity":1.595}]
    // // fs.readFileSync(path )
    return personDB
}

async function get_person_details(id){
    const data = await request(api_call.replace('{{person_id}}',id)).catch(err=>console.error);
    try{
        return JSON.parse(data.body)
    }catch(e){
        console.log(e)
        return {}
    }
}

async function process_data(){
    const file_list = get_file_data();
    for(let f in file_list){
        const person_data = await get_person_details(file_list[f].id);
        let to_disp = `${person_data.id}    ${person_data.name} ${person_data.birthday} ${person_data.gender === 0 ? 'unknown' : person_data.gender === 1 ? 'female': person_data.gender === 2 ? 'male' : 'error'}`
        let displayed = false
        if(person_data.combined_credits && person_data.combined_credits.cast instanceof Array && person_data.combined_credits.cast.length > 0){

            person_data.combined_credits.cast.forEach((eachMovie)=>{
                displayed = true
                console.log(`${to_disp} ${eachMovie.title}  ${eachMovie.release_date}`)
            })
        }
        if(displayed === false){
            console.log(to_disp)
        }
        

    }  
}


process_data().catch(err=>console.err)
