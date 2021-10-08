# Hydra Voting Web App
Smart contract based voting app using React + Firebase and styles with Material UI.

**Load dependencies** 
`npm install`

**Build**
`npm run build`

**Change voting contract address**
before you run migration at voting-smartcontract you will copy the contract address.
at App.js file change the address of the voting contract.
`const scAddress="${your__new_address}"`


**Deployment to firebase**
Login to a permissioned firebase account
`firebase login:ci`

Show your projects list
`firebase projects:list`

Select hydra votingapp project
`firebase use hydra-votingapp`

Deploy your built content
`firebase deploy`

More info mail to: rafael@wiringbits.net