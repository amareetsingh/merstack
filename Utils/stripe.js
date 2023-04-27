const Stripe = require('stripe');


export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string,{
    apiVersion:"2023-03-18"
})