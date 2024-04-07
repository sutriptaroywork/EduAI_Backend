const request = require('supertest')
const app = require('../server')


describe('login api', () => {

    // it('sample test',async()=>{
    //     // const response = await request(app)
    //     //   .post('/api/login')
    //     //   .send({
    //     //     email: 'vigneshpaulraj4@gmail.com', // Replace with a valid email in your database
    //     //     password: 'kv', // Replace with the correct password
    //     //   });
    // })

    it('should login a user and return a token', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: "messi@messi.com", // Replace with a valid email in your database
                password: "messi", // Replace with the correct password
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('userToken');
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'User found');
    }, 40000);

    it('should handle login with missing fields', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                // Missing required fields
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'Missing fields for login');
    },40000);

    it('should handle login with incorrect password', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'messi@messi.com', // Replace with a valid email in your database
                password: 'mess', // Incorrect password
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('message', 'Incorrect password');
    },40000);
    it('should handle login for a non-existent user', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'nonExistentUser@example.com',
                password: 'password123', // Replace with any password
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('message', 'Client not found');
    },40000);
})

