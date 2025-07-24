import Products from "../models/products.js";
import { isAdmin } from "./userController.js";

export async function listProducts(req, res) {
  try {
    const productsList = await Products.find();
    res.json({
      list: productsList,
    });
  } catch (error) {
    res.json({
      message:
        "Due to an error the product list couldnt be identified " + error,
    });
  }
}

export async function newProducts(req, res) {
  console.log(req.user);

  if (req.user == null) {
    res.json({
      message: "You are not logged in",
    });
    return;
  }

  if (!isAdmin(req)) {
    res.json({
      message:
        "You are not an admin and are not authorized to do this function",
    });
    return;
  }

  const { productName, price, description } = req.body;
  if (!productName || !price || !description) {
    res.json({
      message:
        "Missing required fields: name, price, and description are required",
    });
    return;
  }

  const products = new Products(req.body);

  try {
    await products.save();
    res.json({
      message: "The product was added to the database succesfully",
    });
  } catch (error) {
    res.status(403).json({
      message:
        "The product was not added to the database due to an error " + error,
    });
  }
}

export async function delProducts(req, res) {
  console.log(req.user);

  if (req.user == null) {
    res.json({
      message: "You are not logged in",
    });
    return;
  }

  if (!isAdmin(req)) {
    res.json({
      message:
        "You are not an admin and are not authorized to do this function",
    });
    return;
  }

  try {
    const result = await Products.findOneAndDelete({
      productId: req.params.productId,
    });
    if (!result) {
      res.json({
        message:
          "The product with id " + req.params.productId + " was not found",
      });
      return;
    }
    res.json({
      message: "The product was deleted from the database succesfully",
      result,
    });
  } catch (error) {
    res.json({
      message:
        "The product was not deleted from the database due to an error " +
        error,
    });
  }
}

export async function updateProducts(req, res) {
  console.log(req.user);

  if (req.user == null) {
    res.json({
      message: "You are not logged in",
    });
    return;
  }

  if (!isAdmin(req)) {
    res.json({
      message:
        "You are not an admin and are not authorized to do this function",
    });
    return;
  }

  const { productId } = req.params;
  const updateData = req.body;

  try {
    const updatedProduct = await Products.findOneAndUpdate(
      { productId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      res.json({
        message: "The product with id " + productId + " was not found",
      });
      return;
    }
    res.json({
      message: "The product was updated succesfully",
    });
  } catch (error) {
    res.json({
      message: "The product was not updated due to an error " + error,
    });
  }
}

export async function listProductsByName(req, res) {
  const query = req.params.query;

  try {
    const productsList = await Products.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { altNames: { $elemMatch: { $regex: query, $options: "i" } } },
      ],
    });
    if (productsList.length == 0) {
      res.json({
        message: "Product not found",
      });
    } else {
      res.json({
        list: productsList,
      });
    }
  } catch (error) {
    res.json({
      message:
        "Due to an error the product list couldn't be identified " + error,
    });
  }
}

export async function listProductsById(req, res) {
  try {
    const productId = req.params.productId;

    const product = await Products.findOne({ productId: productId });

    res.json(product);
  } catch (error) {
    res.json({
      message: "Due to an error the product couldn't be identified " + error,
    });
  }
}
