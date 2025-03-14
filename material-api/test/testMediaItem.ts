// Test for mediaItem routes
import {MediaItem} from 'hybrid-types/DBTypes';
import {MessageResponse, UploadResponse} from 'hybrid-types/MessageTypes';
import request from 'supertest';
import {Application} from 'express';

const uploadMediaFile = (
  url: string | Application,
  path: string,
  mediaFile: string,
  token: string,
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(path)
      .attach('file', mediaFile)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: UploadResponse = response.body;
          expect(message.message).toBe('file uploaded');
          expect(message.data?.filename).not.toBe('');
          expect(message.data?.filesize).toBeGreaterThan(0);
          expect(message.data?.media_type).not.toBe('');
          resolve(message);
        }
      });
  });
};

const getMediaItems = (url: string | Application): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/media') // Updated path
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItems: MediaItem[] = response.body;
          mediaItems.forEach((mediaItem) => {
            expect(mediaItem.media_id).toBeGreaterThan(0);
            expect(mediaItem.title).not.toBe('');
            expect(mediaItem.media_type).not.toBe('');
            expect(mediaItem.filename).not.toBe('');
            expect(mediaItem.thumbnail).not.toBe('');
            expect(mediaItem.created_at).not.toBe('');
            expect(mediaItem.filesize).toBeGreaterThan(0);
            expect(mediaItem.user_id).toBeGreaterThan(0);
          });
          resolve(mediaItems);
        }
      });
  });
};

const getMediaItem = (
  url: string | Application,
  id: number,
): Promise<MediaItem> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/media/byid/${id}`) // Updated path
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItem: MediaItem = response.body;
          expect(mediaItem.media_id).toBeGreaterThan(0);
          expect(mediaItem.title).not.toBe('');
          expect(mediaItem.media_type).not.toBe('');
          expect(mediaItem.filename).not.toBe('');
          expect(mediaItem.thumbnail).not.toBe('');
          expect(mediaItem.created_at).not.toBe('');
          expect(mediaItem.filesize).toBeGreaterThan(0);
          expect(mediaItem.user_id).toBeGreaterThan(0);
          resolve(mediaItem);
        }
      });
  });
};

const postMediaItem = (
  url: string | Application,
  path: string,
  token: string,
  mediaItem: Partial<MediaItem>,
): Promise<MessageResponse & { media_id: number }> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(mediaItem)
      .expect(200)
      .end((err, response) => { // Use `.end()` instead of `.expect()`
        if (err) {
          reject(err); // Reject the promise if there's an error
        } else {
          resolve(response.body); // Resolve the promise with response body
        }
      });
  });
};

const putMediaItem = (
  url: string | Application,
  id: number,
  token: string,
  mediaItem: Omit<MediaItem, 'media_id' | 'thumbnail' | 'created_at'>,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put(`/api/v1/media/${id}`) // Updated path
      .set('Authorization', `Bearer ${token}`)
      .send(mediaItem)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).toBe('media item updated');
          resolve(message);
        }
      });
  });
};

const deleteMediaItem = (
  url: string | Application,
  id: number,
  token: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/media/byid/${id}`) // Updated path
      .set('Authorization', `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).toBe('Media deleted');
          resolve(message);
        }
      });
  });
};

// functions to test not found 404 for mediaItem routes
const getNotFoundMediaItem = (
  url: string | Application,
  id: number,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/media/${id}`) // Updated path
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

const putNotFoundMediaItem = (
  url: string | Application,
  id: number,
  media_name: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put(`/api/v1/media/${id}`) // Updated path
      .send({media_name})
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

const deleteNotFoundMediaItem = (
  url: string | Application,
  id: number,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/media/${id}`) // Updated path
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

// functions to test invalid data 400 for mediaItem routes
const postInvalidMediaItem = (
  url: string | Application,
  media_name: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/api/v1/media') // Updated path
      .send({media_name})
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

const putInvalidMediaItem = (
  url: string | Application,
  id: string,
  media_name: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .put(`/api/v1/media/${id}`) // Updated path
      .send({media_name})
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

const deleteInvalidMediaItem = (
  url: string | Application,
  id: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/media/${id}`) // Updated path
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

const getInvalidMediaItem = (
  url: string | Application,
  id: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/media/${id}`) // Updated path
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

const getMediaItemsWithPagination = (
  url: string | Application,
  page: number,
  limit: number,
): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/media?page=${page}&limit=${limit}`) // Updated path
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItems: MediaItem[] = response.body;
          expect(mediaItems.length).toBeLessThanOrEqual(limit);
          resolve(mediaItems);
        }
      });
  });
};

const getMostLikedMedia = (url: string | Application): Promise<MediaItem> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/media/mostliked') // Updated path
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItem: MediaItem = response.body;
          expect(mediaItem.media_id).toBeGreaterThan(0);
          resolve(mediaItem);
        }
      });
  });
};

const getMediaByUser = (
  url: string | Application,
  userId: number,
): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/media/byuser/${userId}`) // Updated path
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItems: MediaItem[] = response.body;
          mediaItems.forEach((item) => {
            expect(item.user_id).toBe(userId);
          });
          resolve(mediaItems);
        }
      });
  });
};

const getMediaByToken = (
  url: string | Application,
  token: string,
): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/media/bytoken') // Updated path
      .set('Authorization', `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItems: MediaItem[] = response.body;
          resolve(mediaItems);
        }
      });
  });
};

const getMediaItemById = (
  url: string | Application,
  id: number,
): Promise<MediaItem> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/media/${id}`) // Updated path
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItem: MediaItem = response.body;
          expect(mediaItem.media_id).toBe(id);
          resolve(mediaItem);
        }
      }
      );
  });
};

const getMediaWithSearch = (
  url: string | Application,
  search: string,
  searchBy: string,
): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/media/search?search=${search}&searchBy=${searchBy}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItems: MediaItem[] = response.body;
          expect(mediaItems.length).toBeGreaterThan(0);
          resolve(mediaItems);
        }
      });
  });
};

const mediaByTagnameGet = (
  url: string | Application,
  tagname: string,
): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/media/bytagname/${tagname}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItems: MediaItem[] = response.body;
          expect(Array.isArray(mediaItems)).toBe(true);
          mediaItems.forEach((mediaItem) => {
            expect(mediaItem.media_id).toBeGreaterThan(0);
            expect(mediaItem.title).not.toBe('');
            expect(mediaItem.media_type).not.toBe('');
            expect(mediaItem.filename).not.toBe('');
            expect(mediaItem.thumbnail).not.toBe('');
            expect(mediaItem.created_at).not.toBe('');
            expect(mediaItem.filesize).toBeGreaterThan(0);
            expect(mediaItem.user_id).toBeGreaterThan(0);
          });
          resolve(mediaItems);
        }
      });
  });
};

const mediaByUsernameGet = (
  url: string | Application,
  username: string,
): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/media/byusername/${username}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItems: MediaItem[] = response.body;
          expect(Array.isArray(mediaItems)).toBe(true);
          mediaItems.forEach((mediaItem) => {
            expect(mediaItem.media_id).toBeGreaterThan(0);
            expect(mediaItem.title).not.toBe('');
            expect(mediaItem.media_type).not.toBe('');
            expect(mediaItem.filename).not.toBe('');
            expect(mediaItem.thumbnail).not.toBe('');
            expect(mediaItem.created_at).not.toBe('');
            expect(mediaItem.filesize).toBeGreaterThan(0);
            expect(mediaItem.user_id).toBeGreaterThan(0);
          });
          resolve(mediaItems);
        }
      });
  });
};

const getMediaListByTagId = (
  url: string | Application,
  tagId: number,
): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/tags/bytag/${tagId}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const mediaItems: MediaItem[] = response.body;
          expect(Array.isArray(mediaItems)).toBe(true);
          mediaItems.forEach((mediaItem) => {
            expect(mediaItem.media_id).toBeGreaterThan(0);
            expect(mediaItem.title).not.toBe('');
            expect(mediaItem.media_type).not.toBe('');
            expect(mediaItem.filename).not.toBe('');
            expect(mediaItem.thumbnail).not.toBe('');
            expect(mediaItem.created_at).not.toBe('');
            expect(mediaItem.filesize).toBeGreaterThan(0);
            expect(mediaItem.user_id).toBeGreaterThan(0);
          });
          resolve(mediaItems);
        }
      });
  });
};

export {
  uploadMediaFile,
  getMediaItems,
  getMediaItem,
  postMediaItem,
  putMediaItem,
  deleteMediaItem,
  getNotFoundMediaItem,
  putNotFoundMediaItem,
  deleteNotFoundMediaItem,
  postInvalidMediaItem,
  putInvalidMediaItem,
  deleteInvalidMediaItem,
  getInvalidMediaItem,
  getMediaItemsWithPagination,
  getMostLikedMedia,
  getMediaByUser,
  getMediaByToken,
  getMediaItemById,
  getMediaWithSearch,
  mediaByTagnameGet,
  mediaByUsernameGet,
  getMediaListByTagId,
};
