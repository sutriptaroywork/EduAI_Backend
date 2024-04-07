const request = require('supertest')
const app = require('../server')
const bcrypt = require('bcrypt');
const newUser2 = require('../models/newUser2');

jest.mock('../models/newUser2');


describe('settings api', () => {
  
    const userId='651cf3c366f018e0ecb2078d'
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImNsaWVudElkIjoiNjUxY2YzYzM2NmYwMThlMGVjYjIwNzhkIn0sImlhdCI6MTY5OTM4NzE5NywiZXhwIjoxNjk5NDczNTk3fQ.ebXdk2gG8Xj2B_hhVDlRQsU1W5-8dBIuL4KUia_e4as'

    it('should change user password successfully', async () => {
        // Mocking the findById function to return a user with a hashed password
        newUser2.findById.mockResolvedValue({
          _id: userId,
          password: await bcrypt.hash('messi', 10),
        });
    
        const response = await request(app)
          .post('/api/settings/changepassword')
          .set('Authorization', token)
          .send({
            currentPassword: 'messi',
            newPassword: 'messi123',
            confirmPassword: 'messi123',
          });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Password updated successfully');
      });
    

})

