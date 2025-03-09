
import dotenv from 'dotenv';
dotenv.config();
import {User, UserWithNoSensitiveInfo} from 'hybrid-types/DBTypes';
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


const getUsersWithSearch = (
  url: string | Application,
  username: string,
): Promise<UserWithNoSensitiveInfo[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/users/search/byusername?username=${username}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const users: UserWithNoSensitiveInfo[] = response.body;
          expect(Array.isArray(users)).toBe(true);
          users.forEach((user) => {
            expect(user.user_id).toBeGreaterThan(0);
            expect(user.username).not.toBe('');
            expect(user.created_at).not.toBe('');
            expect(['User', 'Admin', 'Guest']).toEqual(
              expect.arrayContaining([user.level_name]),
            );
          });
          resolve(users);
        }
      });
  });
};

export {registerUser, loginUser, deleteUser, getUsersWithSearch};
