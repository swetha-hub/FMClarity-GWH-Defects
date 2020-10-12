const { GraphQLClient } = require('graphql-request');
const xlsxFile = require('read-excel-file/node');
var Excel = require('exceljs');
let tokenid
let team_id

async function loginandgettoken() {
    const endpoint = 'https://api.staging.fmclarity.com/graphql'
  
    const graphQLClient = new GraphQLClient(endpoint)
  
    const mutation = /* GraphQL */
        `mutation loginWithPassword($email: String!, $password: String!){
        loginWithPassword (email:$email, plainPassword:$password) {
          token
          user {
            team {
              _id
            }
          }
        }
      }`
  
    const variables = {
        "email": "data_import@gwh.com.au",
	    "password": "GWH$Data!"
    }
    const data = await graphQLClient.request(mutation, variables)
    tokenid=  data["loginWithPassword"]["token"]
    team_id=data["loginWithPassword"]["user"]["team"]["_id"]
    console.log('the token is '+ tokenid)
    console.log('the team is '+ team_id)
    console.log(JSON.stringify(data, undefined, 2))
    createWO(tokenid,team_id).catch(error => console.error(error))
  }
 async function createWO(tokenid,team_id) {
  const endpoint = 'https://api.staging.fmclarity.com/graphql'
  let newWorkBook = new Excel.Workbook();
  let newWorkSheet = newWorkBook.addWorksheet('Request Data');
  newWorkSheet.columns = [
    { header: 'Id', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 32 }];

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      "Authorization": 'Bearer '+tokenid,
      "Team": team_id
    },
  })
  xlsxFile('sample workbook.xlsx', {sheet: 'Test Data'}).then((rows) => {
    for (i in rows){
  const mutation = 
  `mutation createRequest($facilityId: ID!, $request: RequestInput!){
    createRequest (facilityId:$facilityId, request:$request) {
      _id
      name
    }
  }
  `

  const variables = {
    facilityId: rows[i][0],
    request: {
		name: rows[i][5],
        level:{
            name:rows[i][1]
          },
          area:{
            name:rows[i][2]
          },
          identifier:{
            name:rows[i][3]
          },
          service: 
          {
            name:rows[i][4]
          },
          type:rows[i][13],
          priority:rows[i][12],
          dueDate:rows[i][11],
          supplierId:rows[i][7],
          assigneeId:rows[i][8],
          description:rows[i][6],
          pointOfContact:{
            _id:rows[i][9]
          },
          pointOfContactTwo:{
            _id:rows[i][10]
          }
	}
  }
  graphQLClient.request(mutation, variables).then((data) => {
  console.log(data)
  console.log(data.createRequest._id)
  console.log(data.createRequest.name)
  newWorkSheet.addRow({id: data.createRequest._id, name: data.createRequest.name}).commit()
  //newWorkSheet=xlsx.utils.json_to_sheet(JSON.parse(data))
 //console.log(Object.values(data))
})
}
})
setTimeout(function(){ sendWorkbook(newWorkBook) }, 70000);
}

function sendWorkbook(workbook){
  workbook.xlsx.writeFile("Request Completion Data.xlsx").then(function() {
    console.log("xlsx file is written.");
  });
}

loginandgettoken().catch((error) => console.error(error))