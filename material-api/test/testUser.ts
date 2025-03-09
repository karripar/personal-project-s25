
import dotenv from 'dotenv';
dotenv.config();
import {User} from 'hybrid-types/DBTypes';
import request from 'supertest';
import {Application} from 'express';
import {LoginResponse, UserDeleteResponse, UserResponse} from 'hybrid-types/MessageTypes';

// functios to test succesful user routes
const registerUser = (
  url: string | Application,
  path: string,
  user: Partial<User>,
): Promise<UserResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(path)
      .send(user)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const newUser: UserResponse = response.body;
          expect(newUser.message).toBe('user created');
          expect(newUser.user.user_id).toBeGreaterThan(0);
          expect(newUser.user.username).toBe(user.username);
          expect(newUser.user.email).toBe(user.email);
          expect(newUser.user.created_at).not.toBe('');
          expect(newUser.user.level_name).toBe('User');
          resolve(newUser);
        }
      });
  });
};

const loginUser = (
  url: string | Application,
  path: string,
  user: {email: string; password: string},
): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(path)
      .send(user)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const login: LoginResponse = response.body;
          expect(login.message).toBe('Login successful');
          expect(login.token).not.toBe('');
          expect(login.user.user_id).toBeGreaterThan(0);
          expect(login.user.username).not.toBe('');
          expect(login.user.email).not.toBe('');
          expect(login.user.created_at).not.toBe('');
          expect(['User', 'Admin', 'Guest']).toEqual(
            expect.arrayContaining([login.user.level_name]),
          );
          resolve(login);
        }
      });
  });
};

const deleteUser = (
  url: string | Application,
  path: string,
  token: string,
): Promise<UserDeleteResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(path)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const result: UserResponse = response.body;
          expect(result.message).toBe('User deleted');
          resolve(result);
        }
      });
  });
};
export {registerUser, loginUser, deleteUser};
