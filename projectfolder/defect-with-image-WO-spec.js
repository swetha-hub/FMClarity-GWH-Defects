const { GraphQLClient } = require('graphql-request');

const {gql} = require ('graphql-request')
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
    createDocument(tokenid,team_id).catch(error => console.error(error))
  }

  async function createDocument(tokenid,team_id) {
    const endpoint = 'https://api.staging.fmclarity.com/graphql'

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          "Authorization": 'Bearer '+tokenid,
          "Team": team_id
        },
    })

    const mutation = 
  `mutation createDocument($facilityId: ID!, $requestId: ID!, $teamId: ID!,$document: DocumentInput!){
    createDocument(facilityId: $facilityId, requestId: $requestId, teamId: $teamId, document: $document) {
      _id
      name
    }
  }
  `
  const variables = {
    facilityId: "SMbEYmdCvzKSudE9Y",
    requestId:"9MKBXFiCbb6kphsof",
    teamId:"JkoNvYqhXxTF6z4NA",
    document:{
        name:"Defect-Water ingress x 2",
        decription:"This is a test Image Document",
        type:"Image",
        image:{
            service:{
                name:"General Repairs & Maintenance"
            },
            supplier:"uGpp8FSYcwyxpL7e2"
        },
        files:"NodeScript/2.jpg",
        visibleTo: [
            "occupier - portfolio manager",
            "occupier - manager",
            "supplier"
          ]
    }
  }
  const data =await graphQLClient.request(mutation, variables)
  console.log(data)
  console.log(data.createRequest._id)
  console.log(data.createRequest.name)
}

loginandgettoken().catch((error) => console.error(error))