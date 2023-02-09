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
        { fields: ["title", "price"], limit: 3 }
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

      // adding Promise.all as it is may return multiple list of items,
      // therefore adding Promise.all

      const lineItems = await Promise.all(
        products.map(async (product) => {
          // finding the product from the database where the key matches with the product key
          // it will return 1 element as the key is unique , but it will return as an array of
          // objects
          const productEntities = await strapi.entityService.findMany(
            "api::product.product",
            {
              filters: {
                key: product.key,
              },
            }
          );

          // productEntities is coming as an array of objects,
          // and the desired product, which matches with key is the top 0th position in
          // the array
          console.log("productEntities", productEntities);
          // product which are coming from the database
          // considering the 0th position of the productEntities ,i.e the matched key
          // getting only the 0th element of the array, which key matched with product.key
          const realProduct = productEntities[0];
          console.log("realProduct", realProduct);
          const image = product.image;
          return {
            price_data: {
              currency: "inr",
              product_data: {
                name: realProduct.title,
                images: [image],
              },
              // unit_amount: product.price * 100,
              unit_amount: realProduct.price * 100,
            },
            quantity: product.quantity,
          };
        })
      );

      const session = await stripe.checkout.sessions.create({
        // line_items: [
        //   {
        //     // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        //     price: "{{PRICE_ID}}",
        //     quantity: 1,
        //   },
        // ],
        shipping_address_collection: { allowed_countries: ["IN"] },
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.CLIENT_BASE_URL}?success=true`,
        cancel_url: `${process.env.CLIENT_BASE_URL}?canceled=true`,
      });

      await strapi.entityService.create("api::order.order", {
        data: {
          products,
          // stripeId: "dummy",
          stripeId: session.id,
        },
      });
      // return { success: true };
      return { stripeId: session.id };
    } catch (err) {
      console.log("error", err);
      ctx.response.status = 500;
      return err;
    }
  },
}));
