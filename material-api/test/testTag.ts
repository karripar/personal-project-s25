import {Tag, TagResponse} from 'hybrid-types/DBTypes';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import request from 'supertest';
import {Application} from 'express';

const postTag = (
  url: string | Application,
  mediaId: number,
  token: string,
  tag: string,
): Promise<TagResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(`/api/v1/tags`)
      .set('Authorization', `Bearer ${token}`)
      .send({tags: [tag], media_id: mediaId})
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: TagResponse = response.body;
          expect(message.message).toBe('Tags added successfully');
          resolve(message);
        }
      });
  });
};

const getTags = (
  url: string | Application,
  mediaId: number,
): Promise<Tag[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/tags/bymedia/${mediaId}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const tags: Tag[] = response.body;
          expect(Array.isArray(tags)).toBe(true);
          resolve(tags);
        }
      });
  });
};

const deleteTag = (
  url: string | Application,
  mediaId: number,
  tag_id: number,
  token: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/tags/bymedia/${mediaId}/${tag_id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).toBe('Tag deleted from media item');
          resolve(message);
        }
      });
  });
};

// 404 error tests
const getNotFoundTag = (
  url: string | Application,
  mediaId: number,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/tags/${mediaId}`)
      .expect(404, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).not.toBe('');
          resolve(message);
        }
      });
  });
};

// 400 error tests
const postInvalidTag = (
  url: string | Application,
  mediaId: number,
  token: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(`/api/v1/tags/${mediaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).not.toBe('');
          resolve(message);
        }
      });
  });
};

export {postTag, getTags, deleteTag, getNotFoundTag, postInvalidTag};
