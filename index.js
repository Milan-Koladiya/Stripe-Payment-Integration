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
    await stripe.customers.create({
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
    }).then((customers) => {
        res.status(200).json({sucess: "true", customer: customers})
    }).catch((err) => {
        console.log(err)
        res.status(400).json({sucess: true, message: "There was error in payment"});
    })
} catch (error) {
    return res.status(400).json({ sucess: "false", message: "There is some error end of us"});
}


})

app.listen(3000, () => {
    console.log("Your App is running on 3000 PORT");
})