import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan'
import winston from 'winston'
import cors from 'cors'
import { v4 }  from 'uuid'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

const AUTHORIZATION_HEADER=`Basic ${btoa(process.env.USERNAME + ':' + process.env.PASSWORD)}`
const DDDS_API = `${process.env.PAYNETWORX_3DS}`
const app = express();


//app.use("/static", express.static("../frontend/dist"))

const serveWithReplace = (directory: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const filePath = path.join(directory, req.path);
        console.log(filePath)
        
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
                console.log(err)
                return next();
            }
            
            // Perform your string replacements here
            const modifiedContent = content
                .replace('PNX_ENDPOINT_URL', DDDS_API)
                
            res.type(path.extname(filePath));
            res.send(modifiedContent);
        });
    };
};
app.use("/static", serveWithReplace(path.join(__dirname, '../../frontend/dist')));

app.use(express.json())
app.use(cors())

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ]
});

app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
// Request body logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    body: req.body
  });
  next();
});

// Response logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const oldJson = res.json;
  res.json = function(body: any) {
    logger.info({
      type: 'response',
      method: req.method,
      url: req.url,
      body: body
    });
    return oldJson.call(this, body);
  };
  next();
});

interface AuthBody {
  cardNumber: string
  cardHolder:string
  expiryDate: string
  cvv: string
  amount: number
}

app.post('/api/auth', async (req: Request, res: Response) => {
  const auth_request = {
    Amount:{
      "Total": req.body.amount,
      "Fee": "0.00",
      "Tax": "0.00",
      "Currency": "USD"
    },
    PaymentMethod:{
      Card:{
        CardPresent: false,
        CVC:{
          CVC:req.body.cvv
        },
        PAN:{
          PAN:req.body.cardNumber,
          ExpMonth:req.body.expiryDate.slice(0,2),
          ExpYear:req.body.expiryDate.slice(2,4)
        }
      },
      "BillingAddress": {
        "Name": "Jane Doe",
        "Line1": "1234 Main St",
        "Line2": "Suite A",
        "City": "Cityville",
        "State": "TX",
        "PostalCode": "75000",
        "Country": "US",
        "Phone": "555-555-5555",
        "Email": "example@example.com"
      }
    },
    POS:{
      "EntryMode": "manual",
      "Type": "ecommerce",
      "Device": "NA",
      "DeviceVersion": "NA",
      "Application": "3ds demo",
      "ApplicationVersion": "1.0",
      "Timestamp": (new Date()).toJSON()
    },
    Detail:{
      MerchantData:{

      }
    },
    ThreedsData:Object.assign({
      deviceChannel:"02", 
      threeDSRequestorURL:"https://example.com",
    },req.body.browser_info || {})
  }

  console.log(JSON.stringify(auth_request,null,2))
  
  try{
    const response = await axios.post(`${DDDS_API}/v0/transaction/auth`,auth_request,{
      headers:{
        'Content-Type':'application/json',
        Authorization:AUTHORIZATION_HEADER,
        'Request-ID':v4()
      }
    })
    console.log(response.status)
    console.log(JSON.stringify(response.data,null,2))

    if(response.data.threeDSMethodURL){
      res.json({
        threeDSServerTransID: response.data.threeDSServerTransID,
        MethodData:{
          threeDSMethodURL: response.data.threeDSMethodURL,
          threeDSMethodNotificationURL: response.data.threeDSMethodNotificationURL
        }
      })
    }else if(response.data.challengeData){
      res.json({
        threeDSServerTransID: response.data.threeDSServerTransID,
        challengeData:{
          CompleteAuthChallengeURL: response.data.CompleteAuthChallengeURL,
          acsURL: response.data.challengeData.acsURL,
          acsChallengeMandated:  response.data.challengeData.acsChallengeMandated,
          encodedCReq:  response.data.challengeData.encodedCReq,
        }
      })
    }else{
      res.json({
        threeDSServerTransID: response.data.threeDSServerTransID,
        PaymentResponse:response.data
      })
    }
    return
  }catch(error){
    if (axios.isAxiosError(error)) {
      console.log(error.response?.status);
      console.log(error.response?.data);
      res.statusCode = 500
      res.json(error.response?.data)
    } else {
      console.log('Unexpected error', error);
      res.statusCode = 500
    }
  }
});





app.get('/api/3ds_method/:tranId', async (req: Request, res: Response) => {
  const tran_id = req.params.tranId

  try{
    const response = await axios.get(`${DDDS_API}/v0/transaction/auth/${tran_id}/3ds_method`,{
      headers:{
        'Content-Type':'application/json',
        Authorization:AUTHORIZATION_HEADER,
        'Request-ID':v4()
      }
    })
    console.log(response)

    if(response.data.challengeData){
      res.json({
        threeDSServerTransID: response.data.threeDSServerTransID,
        challengeData:{
          CompleteAuthChallengeURL: response.data.CompleteAuthChallengeURL,
          acsURL: response.data.challengeData.acsURL,
          acsChallengeMandated:  response.data.challengeData.acsChallengeMandated,
          encodedCReq:  response.data.challengeData.encodedCReq,
        }
      })
    }else{
      res.json({
        threeDSServerTransID: response.data.threeDSServerTransID,
        PaymentResponse:response.data
      })
    }
    return
  }catch(error){
    if (axios.isAxiosError(error)) {
      console.log(error.response?.status);
      console.log(error.response?.data);
      res.statusCode = 500
      res.json(error.response?.data)
    } else {
      console.log('Unexpected error', error);
      res.statusCode = 500
    }
  }

})

const wait_for_result = async (tran_id: string, maxRetries: number = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(`${DDDS_API}/v0/transaction/auth/${tran_id}/auth_challenge`,{
        headers:{
          'Content-Type':'application/json',
          Authorization:AUTHORIZATION_HEADER,
        }
      })
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        if (attempt === maxRetries - 1) {
          throw new Error(`Failed after ${maxRetries} attempts`);
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }
      throw error;
    }
  }
};
app.get('/api/challenge/:tranId', async (req: Request, res: Response) => {
  const tran_id = req.params.tranId

  try{
    const response = await wait_for_result(tran_id)
    console.log(response)
    res.json({
      threeDSServerTransID: response.threeDSServerTransID,
      PaymentResponse:response
    })
    res.statusCode = 200
    return
  }catch(error){
    if (axios.isAxiosError(error)) {
      console.log(error.response?.status);
      console.log(error.response?.data);
      res.statusCode = 500
      res.json(error.response?.data)
    } else {
      console.log('Unexpected error', error);
      res.statusCode = 500
    }
  }
})
app.get('/', (req: Request, res: Response) => {
  res.redirect("/static/index.html");
});

const port ="8080";
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
