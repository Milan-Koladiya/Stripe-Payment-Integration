const express = require('express');
const app = express();
const uuid = require('uuid').v4;
require('dotenv').config();
const stripe = require('stripe')(`${process.env.STRIPE_PUBLIC_KEY}`)

app.use(express.json());

app.post('/product', async (req, res) => {
    const uniquID = uuid();

    const product = await stripe.products.create({
        id: uniquID,
        name: 'Shopnow ECommarce',
        description: "This is fully functionaly E-Commarce site"
      }).then((response) => {
          console.log("Response => ", response);
      }).catch((err) => {
          console.log("Error => ", err);
      })
});

app.post('/payment', async (req, res) => {
    try {
    const bodyData = req.body
    console.log("bodyData => ", bodyData)
    var createCustomer;
    createCustomer = await stripe.customers.list({
        email: bodyData.email
    })
    console.log("{}{}{}{}{}{", createCustomer);
    if(createCustomer.data.length == 0) {
        createCustomer = await stripe.customers.create({
            name: bodyData.fullname,
            email: bodyData.email,
            phone: "1122334455",
            shipping: {
                address : {
                    line1: "100, Prabhukrupa soca",
                    city: "Surat",
                    country: "India"
                },
                name: "Milan Koladiya"
            }
        })
    }
    let createToken;
    if(bodyData.paymentMethod == 'card'){
        console.log("Body Data => ", bodyData)
        createToken = await stripe.tokens.create({
            card: {
                name: bodyData.cardName,
                number: bodyData.cardNumber,
                exp_month: bodyData.cardExpmonth,
                exp_year: bodyData.cardExpyear,
                cvc: bodyData.cardCvv,
            }
        })
    }
    if(bodyData.paymentMethod  == 'bankaccount'){
        createToken = await stripe.tokens.create({
            bank_account: {
                country: 'INDIA',
                currency: 'inr',
                account_holder_name: bodyData.bankHoldername,
                account_holder_type: bodyData.bankHoldertype,
                routing_number: '110000000',
                account_number: bodyData.bankAccountNumber,
              },
        })
    }
    let createCharge = await stripe.charges.create({
            amount: 300,
            currency: 'INR',
            source: createToken.id, 
            customer: createCustomer.id,
            description: req.body.description,
            receipt_email: createCustomer.email,
        })
    return res.status(200).json({sucess: 'true', customer: createCustomer, token: createToken, charge: createCharge})
} catch (error) {
    console.log("Error => ", error)
    return res.status(400).json({ sucess: "false", message: "There is some error end of us"});
}
})

app.listen(3000, () => {
    console.log("Your App is running on 3000 PORT");
})