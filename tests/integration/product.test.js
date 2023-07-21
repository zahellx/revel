const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Product } = require('../../src/database');
const {
  userOne, userTwo, admin, insertUsers,
} = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');

const {
  productOneUserOne, productTwoUserTwo, insertProducts,
} = require('../fixtures/product.fixture');

setupTestDB();

describe('Products routes', () => {
  describe('POST /v1/products', () => {
    let newProduct;

    beforeEach(() => {
      newProduct = {
        name: 'Bmw X3',
        description: 'xDrive30e xLine',
        category: 'Bmw',
        price: 1.278,
      };
    });

    test('should return 201 and successfully create new product if data is ok with an admin', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: newProduct.price,
        userId: admin._id.toString(),
      });

      const dbProduct = await Product.findById(res.body.id);
      expect(dbProduct).toBeDefined();
    });

    test('should return 201 and successfully create new product if data is ok with a user', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: newProduct.price,
        userId: userOne._id.toString(),
      });

      const dbProduct = await Product.findById(res.body.id);
      expect(dbProduct).toBeDefined();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/products').send(newProduct).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if name is already used', async () => {
      await insertUsers([userOne]);
      await insertProducts([productOneUserOne]);
      newProduct.name = productOneUserOne.name;

      await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if category is not contempled', async () => {
      await insertUsers([userOne]);
      await insertProducts([productOneUserOne]);
      newProduct.role = 'invalid';

      await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/products', () => {
    test('should return 200 and apply the default query options with admin', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      const res = await request(app)
        .get('/v1/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: productOneUserOne._id.toString(),
        name: productOneUserOne.name,
        description: productOneUserOne.description,
        category: productOneUserOne.category,
        price: productOneUserOne.price,
        userId: productOneUserOne.userId.toString(),
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      await request(app).get('/v1/products').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all products', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      await request(app)
        .get('/v1/products')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on name field', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      const res = await request(app)
        .get('/v1/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ name: productOneUserOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(productOneUserOne._id.toString());
    });
  });

  describe('GET /v1/products/:productsId', () => {
    test('should return 200 and the product object if data is ok', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      const res = await request(app)
        .get(`/v1/products/${productOneUserOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: productOneUserOne._id.toString(),
        name: productOneUserOne.name,
        description: productOneUserOne.description,
        category: productOneUserOne.category,
        price: productOneUserOne.price,
        userId: productOneUserOne.userId.toString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      await request(app).get(`/v1/products/${productOneUserOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get a product from another user', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      await request(app)
        .get(`/v1/products/${productTwoUserTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the user object if admin is trying to get a product from another user', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      await request(app)
        .get(`/v1/products/${productTwoUserTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 404 error if product is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/users/${productOneUserOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/product/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      await request(app)
        .delete(`/v1/products/${productOneUserOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbProduct = await Product.findById(productOneUserOne._id);
      expect(dbProduct).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      await request(app).delete(`/v1/products/${productOneUserOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to delete another user product', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      await request(app)
        .delete(`/v1/products/${productTwoUserTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productOneUserOne, productTwoUserTwo]);

      await request(app)
        .delete(`/v1/products/${productOneUserOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/products/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if product already is not found', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertProducts([productTwoUserTwo]);

      await request(app)
        .delete(`/v1/users/${productOneUserOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
