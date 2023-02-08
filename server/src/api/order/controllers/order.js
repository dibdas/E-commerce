"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// passing the strapi object insidr the controller
module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  // async exampleAction(ctx) {
  // ctx is for the context , ctx is similar to request
  async customOrderController(ctx) {
    try {
      // ctx.body = 'ok';
      console.log("strapi");
      const reqBody = ctx.body;
      console.log("ctx", ctx);
      console.log("ctx body", ctx.body);
      const entries = await strapi.entityService.findMany(
        // getting all the data of product
        "api::product.product",
        // "api::category.category",
        { fields: ["title", "price"], limit: 4 }
      );
      // return { data: "ok" };
      return { data: entries };
    } catch (err) {
      ctx.body = err;
    }
  },

  // overiding the createCorecontroller with our own implementation
  async create(ctx) {
    try {
      console.log("ctx", ctx);
      const { products } = ctx.request.body;
      console.log("ctx body", ctx.request.body);
      console.log("products", products);

      const lineItems = products.map((product) => {
        return {
          price,
          quantity,
        };
      });

      const session = await stripe.checkout.sessions.create({
        // line_items: [
        //   {
        //     // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        //     price: "{{PRICE_ID}}",
        //     quantity: 1,
        //   },
        // ],
        lineItems: [lineItems],
        mode: "payment",
        success_url: `${YOUR_DOMAIN}?success=true`,
        cancel_url: `${YOUR_DOMAIN}?canceled=true`,
      });

      await strapi.entityService.create("api::order.order", {
        data: {
          products,
          strapiId: "dummy",
        },
      });
      return { success: true };
    } catch (err) {
      console.log("error", err);
      ctx.response.status = 500;
      return err;
    }
  },
}));
