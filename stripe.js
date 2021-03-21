const express = require('express');
const app = express();
const uuid = require('uuid').v4;
require('dotenv').config();
const stripe = require('stripe')(`${process.env.STRIPE_PUBLIC_KEY}`)

app.use(express.json());

app.get('/getbalance', async (req,res) => {
    try {
        const balance = await stripe.balance.retrieve((error, balance) => {
            if(balance){
                return  res.status(200).json({sucess: "true", balance });
            }else{
                throw new Error("Error occuredd")
            }
        })
    } catch (error) {
        res.status(400).json({sucess: "false", message: error.message})
    }
})

app.post('/retrivepayment', async (req, res) => {
    try {
        const bodyData = req.body
        if(!bodyData.paymentID){
            throw new Error("Please add all the filed")
        }
        const retrivepayment = await stripe.charges.retrieve(
            bodyData.paymentID
          );
        res.status(200).json({sucess: "true", retrivepayment });
    } catch (error) {
        res.status(400).json({sucess: "false", error: error.message})
    }
});

app.post('/product', async (req, res) => {
    try {
        const bodyData = req.body
        if(!bodyData.name || !bodyData.description){
            return res.status(400).json({sucess: "false", error: "Please fill all the field"});
        }
        const product = await stripe.products.create({
            name: bodyData.name,
            description: bodyData.description
          })
        res.status(200).json({sucess: "true", product });
    } catch (error) {
        res.status(400).json({sucess: "false", error: error.message})
    }
});

app.post('/plane', async(req,res) => {
    try {
        const bodyData = req.body
        console.log("BodyData => ", bodyData)
        if(!bodyData.amount || !bodyData.currency || !bodyData.interval || !bodyData.product) {
            throw new Error("Please fill all the field");
        }
        const plane = await stripe.plans.create({
            amount: bodyData.amount * 100,
            currency: bodyData.currency,
            interval: bodyData.interval,
            product: bodyData.product,
            active: bodyData.active
        })
        res.status(200).json({sucess: "true", plane });
    } catch (error) {
        res.status(400).json({sucess: "false", error: error.message})
    }
})

app.post('/updatePlane', async (req,res) => {
    try {
        const bodyData = req.body
        const plane = await stripe.plans.update(bodyData.planeId,{
            active: bodyData.active
        })
        res.status(200).json({sucess: "true", plane });
    } catch (error) {
        res.status(400).json({sucess: "false", error: error.message})
    }
})

app.post('/subsription', async (req,res) => {
    try {
        const bodyData = req.body
        if(!bodyData.customerId || !bodyData.planeId ) {
            throw new Error("Please fill all the field");
        }
        const subscription = await stripe.subscriptions.create({
            customer: bodyData.customerId,
            items: [
                {price: bodyData.planeId},
              ],
        })
        res.status(200).json({sucess: "true", subscription });
    } catch (error) {
        res.status(400).json({sucess: "false", error: error.message});
    }
})

app.post('/payment', async (req, res) => {
    try {
    const bodyData = req.body
    var createCustomer;
    createCustomer = await stripe.customers.list({
        email: bodyData.email
    })
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
                country: 'IN',
                currency: 'inr',
                account_holder_name: bodyData.bankHoldername,
                account_holder_type: bodyData.bankHoldertype,
                routing_number: bodyData.routingNumber,
                account_number: bodyData.bankAccountNumber,
              },
        })
    }
    let createCharge = await stripe.charges.create({
            amount: bodyData.price * 100,
            currency: 'INR',
            source: createToken.id, 
            customer: createCustomer.id,
            description: req.body.description,
            receipt_email: createCustomer.email,
        })
    return res.status(200).json({sucess: 'true', customer: createCustomer, token: createToken, charge: createCharge})
} catch (error) {
    return res.status(400).json({ sucess: "false", message: error.message});
}
})

app.listen(3000, () => {
    console.log("Your App is running on 3000 PORT");
})