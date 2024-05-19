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

app.post("/investments/generate-csv", async (req, res) => {
  try {
    console.log("Generating CSV file")
    // Fetch the investments service to get the investments
    const investments = await new Promise((resolve, reject) => {
      request.get(`${config.investmentsServiceUrl}/investments`, { json: true }, (e, _r, investments) => {
        if (e) reject(e);
        else resolve(investments);
      });
    });
    
    // Fetch the companies service to get the companies
    const companies = await new Promise((resolve, reject) => {
      request.get(`${config.companiesServiceUrl}/companies`, { json: true }, (e, _r, companies) => {
        if (e) reject(e);
        else resolve(companies);
      });
    });
    
    // Write a helper function to get the company name from the company id
    const getCompanyNameById = (id) => {
      const company = companies.find(c => c.id === id);
      return company ? company.name : '';
    };
    
    // Convert the investments to CSV format
    const convertInvestmentsToCSV = (investments) => {
      let csvRows = ["User|First Name|Last Name|Date|Holding|Value"];
      investments.forEach(investment => {
        investment.holdings.forEach(holding => {
          const row = [
            investment.userId,
            investment.firstName,
            investment.lastName,
            investment.date,
            getCompanyNameById(holding.id),
            investment.investmentTotal * holding.investmentPercentage
          ].join('|');
          csvRows.push(row);
        });
      });
      return csvRows.join("\r\n");
    };
    
    // Generate the CSV file
    const report = convertInvestmentsToCSV(investments);

    // Send the CSV file to the Export endpoint
    request.post({
      url: `${config.investmentsServiceUrl}/investments/export`,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ csv: report }),
    }, (e) => {
      if (e) {
        console.error(e);
        res.sendStatus(500);
      } else {
        res.send(report);
      }
    });
    
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})

if (require.main === module) {
  const port = config.get('port') || 8083
  
  app.listen(port, (err) => {
    if (err) {
      console.error("Error occurred starting the server", err)
      process.exit(1)
    }
    console.log(`Server running on port ${config.port}`)
  });
}

module.exports = app;
