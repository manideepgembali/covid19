const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname,"covid19India.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
app.use(express.json());

const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at https://localhost:3000");
    });
  } catch (e) {
    console.log(`database error is${e.message}`);
    process.exit(1);
  }
};

initialiseDbAndServer();

const convertObj=(objectItem)=>{
    return  stateId: objectItem.state_id,
    stateName: objectItem.state_name,
    population: objectItem.population
}
const convertObj1=(objectItem)=>{
    return  districtId: objectItem.districtId,
    districtName: objectItem.districtName,
    stateId: objectItem.stateId,
    cases:objectItem.cases,
    cured:objectItem.cured,
    active:objectItem.active,
    deaths:objectItem.deaths
}
const convertObj3=(objectItem)=>{
    return  
    cases:objectItem.cases,
    cured:objectItem.cured,
    active:objectItem.active,
    deaths:objectItem.deaths
}
const convertObj2=(objectItem)=>{
    return  
    stateName: objectItem.state_name,
}
//1
app.get("/states/",async(request,response)=>{
    const getStates=`select * from state`
    const result=await db.all(getStates)
    response.send(result.map((eachItem)=>convertObj(eachItem)))
});
//2
app.get("/states/:stateId/",async(request,response)=>{
    const {stateId}=request.params
    const getStates=`select * from state where state_id=${stateId}`
    const result=await db.all(getStates)
    response.send(result.map((eachItem)=>convertObj(eachItem)))
});
//3
app.post("/districts/",async(request,response)=>{
    const {districtName,stateId,cases,cured,active,deaths}=request.body
    const postDistrict=`INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
    values(${districtName},${stateId},${cases},${cured},${active},${deaths})`
    const postDistrictQuery=await db.run(postDistrict)
    responce.send("District Successfully Added")
})
//4
app.get("/districts/:districtId/",async(request,response)=>{
    const {districtId}=request.params
    const getStates=`select * from district where district_id=${districtId}`
    const result=await db.all(getStates)
    response.send(result.map((eachItem)=>convertObj1(eachItem)))
});
//5
app.delete("districts/:districtId/",async(request,responce)=>{
    const {deleteId}=request.params
    const deleteDistrict=`delete from district where district_id=${districtId}`
    await db.run(deleteDistrict)
    response.send("District Removed")
})
//6
app.put("/districts/:districtId/",async(request,response)=>{
    const {districtId}=request.params
    const {districtName,stateId,cases,cured,active,deaths}=request.body
    const updateQuery=`update district set district_name=${districtName},state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths}`
    await db.run(updateQuery)
    resonse.send("District Details Updated")
})
//7
app.get("/states/:stateId/stats/",async(request,response)=>{
    const {stateId}=request.params
    const getQuery=`select sum(cases) as totalCases,sum(cured) as totalCured,sum(active) as totalActive,sum(deaths) as totalDeaths
    from district where state_id=${stateId}`
    const getQueryResult=await db.all(getQuery)
    response.send(getQueryResult.map((eachItem)=>convertObj3(eachItem)))
})
//8
app.get("/districts/:districtId/details/",async(request,response)=>{
    const {districtId}=request.params
    const getState=`select state_name from state innerjoin district on district.state_id=state.state_id where district_id=${districtId}`
    const getStateQuery=await db.run(getState)
    response.send(getStateQuery.map((eachItem)=>convertObj2(eachItem)))
})

module.exports=app
