const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      res.send(investments)
    }
  })
})

app.post("/generate-csv", async (req, res) => {
  try {
    // Fetch the investments service to get the investments
    // Fetch the companies service to get the companies
    // Write a helper function to get the company name from the company id
    // Convert the investments to CSV format
    // Generate the CSV file
    // Send the CSV file to the Export endpoint
  } catch (e) {
    console.error(e)
    res.send(500)
  }
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
