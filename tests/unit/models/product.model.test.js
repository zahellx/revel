const { Product } = require('../../../src/database');

describe('Product model', () => {
  describe('Product validation', () => {
    let newProduct;
    beforeEach(() => {
      newProduct = {
        name: 'Audi A3',
        description: 'Sportback S line 30 TDI 85kW S tronic',
        category: 'Audi',
        price: 765,
      };
    });

    test('should correctly validate a valid product', async () => {
      await expect(new Product(newProduct).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if dont have a name', async () => {
      delete newProduct.name;
      await expect(new Product(newProduct).validate()).rejects.toThrow();
    });

    test('should throw a validation error if dont have a description', async () => {
      delete newProduct.description;
      await expect(new Product(newProduct).validate()).rejects.toThrow();
    });

    test('should throw a validation error if dont have a category', async () => {
      delete newProduct.category;
      await expect(new Product(newProduct).validate()).rejects.toThrow();
    });

    test('should throw a validation error if dont have a price', async () => {
      delete newProduct.price;
      await expect(new Product(newProduct).validate()).rejects.toThrow();
    });

    test('should throw a validation error if incorrect category', async () => {
      newProduct.category = 'incorrect category';
      await expect(new Product(newProduct).validate()).rejects.toThrow();
    });
  });
});
