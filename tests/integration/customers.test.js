const mongoose  = require('mongoose');
const request = require('supertest');
const {Customer} = require('../../models/customer');
const {User} = require('../../models/user');


describe('/api/customers', () => {
    let server;
    let token;
    beforeEach( async () => {
        server = require('../../app');
        if(process.env.NODE_ENV === 'test')
            await Customer.deleteMany({});
        token = new User().generateAuthToken();
    });
    afterEach( async () => {
        await server.close();
        await Customer.deleteMany({});
    });
    describe('GET /', () => {
        beforeEach( async () => {
            await Customer.insertMany( [ 
                { name: 'name1', isGold: true, phone: '1234567'},
                { name: 'name2', phone: '1234566'}
            ]);
        });
        const exec = () => {
            return request(server)
                .get('/api/customers')
                .set('x-auth-token',token)
        };
        it('should return 401 if not logged in', async () =>{
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });
        it('should return the list of customers', async () => {
            const response = await exec();
            expect(response.status).toBe(200);
            expect(response.body.some(customer => customer.name === 'name1')).toBeTruthy();
            expect(response.body.some(customer => customer.name === 'name2')).toBeTruthy();
        });
    });
    describe('GET /:id', () => {
        let customer;
        let customerId;
        beforeEach( async () => {
            customer = new Customer({
                name: 'name1',
                phone: '1234567'
            });
            await customer.save();
            customerId = customer._id;
        });
        const exec = () => {
            return request(server)
                .get(`/api/customers/${customerId}`)
                .set('x-auth-token', token)
        };
        it('should return 401 if user is not logged in', async () =>{
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });
        it('should return 400 if id is invalid', async ()=> {
            customerId = '1';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 404 if no customer found', async ()=> {
            customerId = new mongoose.Types.ObjectId();
            const response = await exec();
            expect(response.status).toBe(404);
        });
        it('should return customer if id is valid', async ()=> {
            const response = await exec();
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'name1');
        });
    });
    describe('POST /', () => {
        let customer;
        beforeEach( async () => {
            customer = new Customer({
                _id: new mongoose.Types.ObjectId(),
                name : 'name1',
                phone : '1234567'
            });
        });
        const exec = () => {
            return request(server)
                .post('/api/customers')
                .set('x-auth-token', token)
                .send({ name: customer.name , phone: customer.phone })
        }
        it('should return 401 if user not logged in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });
        it('should return 400 if name is less than 5 characters', async () => {
            customer.name = 'abc';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if name is more than 50 characters', async () => {
            customer.name = new Array(52).join('a');
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if phone is more than 50 characters', async () => {
            customer.phone = new Array(52).join('1');
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if phone is less than 5 characters', async () => {
            customer.phone = '123';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return the customer object if request is processed', async () => {
            const response = await exec();
            expect(response.body).toHaveProperty('name', customer.name);
            expect(response.body).toHaveProperty('phone', customer.phone);
        });
        it('should save the customer if the request is valid', async () => {
            const response = await exec();
            const customerInDb = await Customer.findOne({ name: customer.name })
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('phone', customerInDb.phone);
            expect(response.body).toHaveProperty('isGold', customerInDb.isGold);
        });
    });
    describe('PUT /:id', () => {
        let newName;
        let newPhone;
        let customerId;
        beforeEach( async () => {
            customerId = new mongoose.Types.ObjectId().toHexString()
            customer = new Customer({
                _id: customerId,
                name : 'name1',
                phone : '1234567'
            });
            await customer.save();
            newName = 'newName1';
            newPhone = 'newPhone1';
        });
        const exec = () => {
            return request(server)
                .put(`/api/customers/${customerId}`)
                .set('x-auth-token', token)
                .send({ name: newName, phone: newPhone})
        };
        it('should return 401 is not logged it in', async () => {
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });
        it('should return 400 if the id is invalid', async () => {
            customerId = 1;
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 404 if no customer is found with the id', async () => {
            customerId = new mongoose.Types.ObjectId();
            const response = await exec();
            expect(response.status).toBe(404);
        });
        it('should return 400 if name is less than 5 characters', async () => {
            newName = 'abc';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if name is more than 50 characters', async () => {
            newName = new Array(52).join('a');
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if phone is more than 50 characters', async () => {
            newPhone = new Array(52).join('1');
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if phone is less than 5 characters', async () => {
            newPhone = '123';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should update in DB if the request is valid', async () => {
            const response = await exec();
            const customerInDb = await Customer.findOne({ _id: customerId});
            expect(customerInDb).toHaveProperty('name', newName);
            expect(customerInDb).toHaveProperty('phone', newPhone);
        });
        it('should return the updated customer if the request is processed', async () => {
            const response = await exec();
            expect(response.body).toHaveProperty('name', newName);
            expect(response.body).toHaveProperty('phone', newPhone);
        });
    });
    describe('DELETE /:id', () => {
        let customerId;
        beforeEach( async () =>{
            token = new User({isAdmin:true}).generateAuthToken();
            customer = new Customer({
                name : 'name1',
                phone : '1234567'
            });
            await customer.save();
            customerId = customer._id;
        });
        const exec = () => {
            return request(server)
                .delete(`/api/customers/${customerId}`)
                .set('x-auth-token', token)
        };
        it('should return 401 if user not logged in', async () =>{
            token = '';
            const response = await exec();
            expect(response.status).toBe(401);
        });
        it('should return 403 if user is not an admin', async () =>{
            token = new User({}).generateAuthToken();
            const response = await exec();
            expect(response.status).toBe(403);
        });
        it('should return 400 if id is invalid', async () =>{
            customerId = '1';
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 404 if no customer is found with the id', async () =>{
            customerId = new mongoose.Types.ObjectId();
            const response = await exec();
            expect(response.status).toBe(404);
        });
        it('should delete the customer if valid id', async () =>{
            const response = await exec();
            const customerInDb = await Customer.findOne({ _id: customerId});
            expect(response.status).toBe(200);
            expect(customerInDb).toBeNull();
        });
    });
});