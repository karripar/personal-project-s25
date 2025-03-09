import dotenv from 'dotenv';
dotenv.config();
import {
  Like,
  MediaItem,
  UserWithNoPassword,
  UserWithUnhashedPassword,
} from 'hybrid-types/DBTypes';
import {
  uploadMediaFile,
  getMediaItems,
  getMediaItem,
  postMediaItem,
  getMostLikedMedia,
  getMediaByUser,
  getMediaByToken,
  deleteMediaItem,
  getMediaWithSearch,
  mediaByTagnameGet,
  mediaByUsernameGet,
  getMediaListByTagId
} from './testMediaItem';
import { postProfilePicture, putProfilePicture, uploadProfilePictureFile, getProfilePicture } from './testProfilepicture';
import { postFollow, getFollowersWithInvalidUserId, getFollowersWithToken, getFollowingWithToken, deleteFollow } from './testFollow';
import { getFavoritesByUserId, postFavorite, deleteFavorite, getNegativeFavoriteStatus } from './testFavorite';
import randomstring from 'randomstring';
import {UploadResponse} from 'hybrid-types/MessageTypes';
import {loginUser, registerUser, deleteUser, getUsersWithSearch} from './testUser';
import app from '../src/app';
// const app = 'http://localhost:3000';
import {postTag, getTags, deleteTag} from './testTag';
import {postLike, getLikes, deleteLike, getLikesByUser} from './testLike';
import {postComment, getComments, deleteComment} from './testComment';

if (!process.env.AUTH_SERVER || !process.env.UPLOAD_SERVER) {
  throw new Error('Missing environment variables for API tests');
}
const authApi = process.env.AUTH_SERVER;
const uploadApi = process.env.UPLOAD_SERVER;

describe('Media API Success Cases', () => {
  // test create user
  let token: string;
  let user: UserWithNoPassword;
  const testUser: Partial<UserWithUnhashedPassword> = {
    username: 'Test_User_' + randomstring.generate(7),
    email: randomstring.generate(9).toLowerCase() + '@user.fi',
    password: 'asdfQEWR1234',
  };
  it('should create a new user', async () => {
    await registerUser(authApi, '/users', testUser);
  });

  // test login
  it('should return a user object and bearer token on valid credentials', async () => {
    const response = await loginUser(authApi, '/auth/login', {
      email: testUser.email!,
      password: testUser.password!,
    });
    token = response.token;
    user = response.user;
  });

  // test upload media file
  let uploadResponse: UploadResponse;
  it('should upload a media file', async () => {
    const mediaFile = './test/testfiles/testPic.jpeg';
    uploadResponse = await uploadMediaFile(
      uploadApi,
      '/upload',
      mediaFile,
      token,
    );
  });

  let testMediaItem: {message: string; media_id: number};

  it('should post a media item', async () => {
    jest.setTimeout(30000); // Increase timeout if the test is taking a long time

    if (uploadResponse.data) {
      const mediaItem: Partial<MediaItem> = {
        title: 'Test Pic',
        description: 'A test picture',
        filename: uploadResponse.data.filename,
        media_type: uploadResponse.data.media_type,
        filesize: uploadResponse.data.filesize,
      };

      const response = await postMediaItem(
        app,
        '/api/v1/media',
        token,
        mediaItem,
      );

      // Log the response to verify the structure
      console.log(response);

      // Now expect the response to contain message and media_id, not the full MediaItem
      expect(response.message).toBe('Media created');
      expect(response.media_id).toBeDefined(); // You can add further checks here based on your expectations
      testMediaItem = response;
    }
  });

  // test profile picture
  let profileResponse: UploadResponse;
  it('should upload a profile picture', async () => {
    const mediaFile = './test/testfiles/testPic.jpeg';
    profileResponse = await uploadProfilePictureFile(uploadApi, '/profile', mediaFile, token);
  });

  it('should post a profile picture', async () => {
    if (uploadResponse.data) {
    const mediaItem: Partial<MediaItem> = {
      filename: profileResponse.data.filename,
      media_type: profileResponse.data.media_type,
      filesize: profileResponse.data.filesize,
    };

    await postProfilePicture(authApi, '/users/profile/picture', token, mediaItem);
  }
  });

  it('should put a profile picture', async () => {
    const mediaItem: Partial<MediaItem> = {
      filename: profileResponse.data.filename,
      media_type: profileResponse.data.media_type,
      filesize: profileResponse.data.filesize,
    };

    await putProfilePicture(authApi, `/users/update/picture/${user.user_id}`, token, mediaItem);
  });

  it('should get a profile picture', async () => {
    await getProfilePicture(authApi, `/users/profile/picture/`, user.user_id);
  });

  it('should get users with search', async () => {
    await getUsersWithSearch(authApi, 'Test_User');
  });

  it('should get media items with search', async () => {
    await getMediaWithSearch(app, 'Test Pic', 'title');
  });

  it('should get media items by username', async () => {
    await mediaByUsernameGet(app, user.username);
  });

  // test succesful media routes
  it('Should get array of media items', async () => {
    const mediaItems = await getMediaItems(app);
    expect(Array.isArray(mediaItems)).toBe(true);
  });

  it('Should get media item by id', async () => {
    const mediaItem = await getMediaItem(app, testMediaItem.media_id);
    expect(mediaItem.media_id).toBe(testMediaItem.media_id);
  });

  it('Should get most liked media', async () => {
    const mediaItem = await getMostLikedMedia(app);
    expect(mediaItem.media_id).toBeGreaterThan(0);
  });

  it('Should get media by user', async () => {
    const mediaItems = await getMediaByUser(app, user.user_id);
    mediaItems.forEach((item) => {
      expect(item.user_id).toBe(user.user_id);
    });
  });

  it('Should get media by token', async () => {
    const mediaItems = await getMediaByToken(app, token);
    expect(Array.isArray(mediaItems)).toBe(true);
  });

  // test tag operations
  let tag_id = 0;
  it('Should add a tag to media item', async () => {
    const response = await postTag(
      app,
      testMediaItem.media_id,
      token,
      'test-tag',
    );
    expect(response.message).toBe('Tags added successfully');
    tag_id = response.tags[0].tag_id;
  });

  it('Should get media list by tag id', async () => {
    await getMediaListByTagId(app, tag_id);
  });

  it('Should get tags by media id', async () => {
    const tags = await getTags(app, testMediaItem.media_id);
    expect(Array.isArray(tags)).toBe(true);
  });

  it('Should get media by tag name', async () => {
    await mediaByTagnameGet(app, 'test-tag');
  });

  // test like operations
  it('Should add a like to media item', async () => {
    await postLike(app, testMediaItem.media_id, token);

  });

  it('Should get likes count by media id', async () => {
    await getLikes(app, testMediaItem.media_id);
  });

  let like: Like;
  it('Should get likes by user id', async () => {
    like = await getLikesByUser(app, testMediaItem.media_id, token);
    expect(like.media_id).toBe(testMediaItem.media_id);
  });

  // test comment operations
  it('Should add a comment to media item', async () => {
    await postComment(app, testMediaItem.media_id, token, 'Test comment');
  });

  it('Should get comments by media id', async () => {
    const comments = await getComments(app, testMediaItem.media_id);
    expect(Array.isArray(comments)).toBe(true);
  });

  it('Should delete a comment', async () => {
    const comments = await getComments(app, testMediaItem.media_id);
    await deleteComment(app, comments[0].comment_id, token);
  });

  it('Should delete a like', async () => {
    await deleteLike(app, like.like_id, token);
  });

  it('Should add a favorite', async () => {
    await postFavorite(app, testMediaItem.media_id, token);
  });

  it('Should get favorites by user id', async () => {
    await getFavoritesByUserId(app, user.user_id, token);
  });

  it('Should delete a favorite', async () => {
    await deleteFavorite(app, testMediaItem.media_id, token);
  });

  it('Should get negative favorite status', async () => {
    await getNegativeFavoriteStatus(app, 99999, token);
  });

  // test follow operations
  const testTargetUserId = 5;
  let followId = 0;
  it('Should add a follow', async () => {
    const response = await postFollow(app, testTargetUserId, token);
    followId = response.follow_id;
  });

  it('Should get followers by token', async () => {
    await getFollowersWithToken(app, token);
  });

  it('Should get followers with invalid user id', async () => {
    await getFollowersWithInvalidUserId(app, 99999);
  });

  it('Should get following by token', async () => {
    await getFollowingWithToken(app, token);
  });

  it('Should delete a follow', async () => {
    await deleteFollow(app, followId, token);
  });

  it('Should delete a tag from media item', async () => {
    await deleteTag(app, testMediaItem.media_id, tag_id, token);
  });

  it('Should delete media item', async () => {
    await deleteMediaItem(app, testMediaItem.media_id, token);
  });

  it('Should delete user', async () => {
    await deleteUser(authApi, '/users', token);
  });
});
