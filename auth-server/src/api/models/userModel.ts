import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {promisePool} from '../../lib/db';
import {
  UserWithLevel,
  User,
  UserWithNoPassword,
  UserWithUnhashedPassword,
  UserWithNoSensitiveInfo,
  ProfilePicture,
  UserWithProfilePicture,
} from 'hybrid-types/DBTypes';
import {UserDeleteResponse} from 'hybrid-types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {customLog} from '../../lib/functions';

const uploadPath = process.env.PROFILE_UPLOAD_URL;

const getUserById = async (id: number): Promise<UserWithProfilePicture> => {
  const [rows] = await promisePool.execute<
    RowDataPacket[] & UserWithProfilePicture[]
  >(
    `SELECT Users.user_id, Users.username, Users.email, Users.created_at, UserLevels.level_name, ProfilePictures.filename, Users.bio
     FROM Users
     JOIN UserLevels ON Users.user_level_id = UserLevels.user_level_id
    LEFT JOIN ProfilePictures ON Users.user_id = ProfilePictures.user_id
     WHERE Users.user_id = ?`,
    [id],
  );
  if (rows.length === 0) {
    customLog('getUserById: User not found');
    throw new CustomError('User not found', 404);
  }
  return rows[0];
};

const getUserBySearch = async (
  search: string,
): Promise<UserWithNoSensitiveInfo[]> => {
  const [rows] = await promisePool.execute<
    RowDataPacket[] & UserWithNoSensitiveInfo[]
  >(
    `SELECT Users.user_id, Users.username, Users.bio, Users.created_at, UserLevels.level_name, ProfilePictures.filename
     FROM Users
     JOIN UserLevels ON Users.user_level_id = UserLevels.user_level_id
     LEFT JOIN ProfilePictures ON Users.user_id = ProfilePictures.user_id
     WHERE LOWER(Users.username) LIKE LOWER(?)
     LIMIT 10`,
    [`%${search}%`],
  );
  return rows;
};

const getUserByUsernameWithoutPassword = async (
  username: string,
): Promise<UserWithNoPassword> => {
  const [rows] = await promisePool.execute<
    RowDataPacket[] & UserWithNoPassword[]
  >(
    `SELECT Users.user_id, Users.username, Users.email, Users.bio, Users.created_at, UserLevels.level_name, ProfilePictures.filename
     FROM Users
     JOIN UserLevels ON Users.user_level_id = UserLevels.user_level_id
     LEFT JOIN ProfilePictures ON Users.user_id = ProfilePictures.user_id
     WHERE Users.username = ?`,
    [username],
  );
  if (rows.length === 0) {
    customLog('getUserByUsernameWithoutPassword: User not found');
    throw new CustomError('User not found', 404);
  }
  return rows[0];
};

const getAllUsers = async (): Promise<UserWithProfilePicture[]> => {
  const [rows] = await promisePool.execute<
    RowDataPacket[] & UserWithProfilePicture[]
  >(
    `SELECT
  Users.user_id,
  Users.username,
  Users.email,
  ProfilePictures.filename,
  Users.bio,
  Users.created_at,
  UserLevels.level_name
FROM Users
JOIN UserLevels ON Users.user_level_id = UserLevels.user_level_id
LEFT JOIN ProfilePictures ON Users.user_id = ProfilePictures.user_id;
`,
  );
  return rows; // Return empty array if no users found
};

const getUserByEmail = async (email: string): Promise<UserWithLevel> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & UserWithLevel[]>(
    `SELECT Users.user_id, Users.username, Users.bio, Users.password_hash, Users.email, Users.created_at, UserLevels.level_name, ProfilePictures.filename
     FROM Users
     JOIN UserLevels ON Users.user_level_id = UserLevels.user_level_id
     LEFT JOIN ProfilePictures ON Users.user_id = ProfilePictures.user_id
     WHERE Users.email = ?`,
    [email],
  );
  if (rows.length === 0) {
    customLog('getUserByEmail: User not found');
    throw new CustomError('User not found', 404);
  }
  return rows[0];
};

const getUserByUsername = async (username: string): Promise<UserWithLevel> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & UserWithLevel[]>(
    `SELECT Users.user_id, Users.username, Users.bio, Users.password_hash, Users.email, Users.created_at, UserLevels.level_name, ProfilePictures.filename
     FROM Users
     JOIN UserLevels ON Users.user_level_id = UserLevels.user_level_id
     LEFT JOIN ProfilePictures ON Users.user_id = ProfilePictures.user_id
     WHERE Users.username = ?`,
    [username],
  );
  if (rows.length === 0) {
    customLog('getUserByUsername: User not found');
    throw new CustomError('User not found', 404);
  }
  return rows[0];
};

const createUser = async (
  user: Pick<UserWithUnhashedPassword, 'username' | 'password' | 'email'>,
  userLevelId = 2,
): Promise<UserWithNoPassword> => {
  const sql = `INSERT INTO Users (username, password_hash, email, user_level_id)
       VALUES (?, ?, ?, ?)`;
  const stmt = promisePool.format(sql, [
    user.username,
    user.password,
    user.email,
    userLevelId,
  ]);
  const [result] = await promisePool.execute<ResultSetHeader>(stmt);

  if (result.affectedRows === 0) {
    customLog('createUser: Failed to create user');
    throw new CustomError('Failed to create user', 500);
  }

  return await getUserById(result.insertId);
};

const modifyUser = async (
  user: Partial<User>,
  id: number,
): Promise<UserWithNoPassword> => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const allowedFields = [
      'username',
      'email',
      'password_hash',
      'user_level_id',
    ];
    const updates = Object.entries(user)
      .filter(([key]) => allowedFields.includes(key))
      .map(([key]) => `${key} = ?`);
    const values = Object.entries(user)
      .filter(([key]) => allowedFields.includes(key))
      .map(([, value]) => value);

    if (updates.length === 0) {
      customLog('modifyUser: No valid fields to update');
      throw new CustomError('No valid fields to update', 400);
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE Users SET ${updates.join(', ')} WHERE user_id = ?`,
      [...values, id],
    );

    if (result.affectedRows === 0) {
      customLog('modifyUser: User not found');
      throw new CustomError('User not found', 404);
    }

    const updatedUser = await getUserById(id);
    await connection.commit();
    return updatedUser;
  } finally {
    connection.release();
  }
};

const modifyProfileInfo = async (
  user: Partial<User>,
  id: number,
): Promise<UserWithNoPassword> => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const allowedFields = ['username', 'bio'];
    const updates = Object.entries(user)
      .filter(([key]) => allowedFields.includes(key))
      .map(([key]) => `${key} = ?`);
    const values = Object.entries(user)
      .filter(([key]) => allowedFields.includes(key))
      .map(([, value]) => value);

    if (updates.length === 0) {
      customLog('modifyUser: No valid fields to update');
      throw new CustomError('No valid fields to update', 400);
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE Users SET ${updates.join(', ')} WHERE user_id = ?`,
      [...values, id],
    );

    if (result.affectedRows === 0) {
      customLog('modifyUser: User not found');
      throw new CustomError('User not found', 404);
    }

    const updatedUser = await getUserById(id);
    await connection.commit();
    return updatedUser;
  } finally {
    connection.release();
  }
};

const deleteUser = async (id: number): Promise<UserDeleteResponse> => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM Comments WHERE user_id = ?;', [id]);
    await connection.execute('DELETE FROM Likes WHERE user_id = ?;', [id]);
    await connection.execute('DELETE FROM Ratings WHERE user_id = ?;', [id]);
    await connection.execute(
      'DELETE FROM Comments WHERE media_id IN (SELECT media_id FROM MediaItems WHERE user_id = ?);',
      [id],
    );
    await connection.execute(
      'DELETE FROM Likes WHERE media_id IN (SELECT media_id FROM MediaItems WHERE user_id = ?);',
      [id],
    );
    await connection.execute(
      'DELETE FROM Ratings WHERE media_id IN (SELECT media_id FROM MediaItems WHERE user_id = ?);',
      [id],
    );
    await connection.execute(
      'DELETE FROM MediaTags WHERE media_id IN (SELECT media_id FROM MediaItems WHERE user_id = ?);',
      [id],
    );
    await connection.execute('DELETE FROM MediaItems WHERE user_id = ?;', [id]);
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM Users WHERE user_id = ?;',
      [id],
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      customLog('deleteUser: User not found');
      throw new CustomError('User not found', 404);
    }

    console.log('result', result);
    return {message: 'User deleted', user: {user_id: id}};
  } finally {
    connection.release();
  }
};

const getProfilePictureById = async (
  profile_picture_id: number,
): Promise<ProfilePicture> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & ProfilePicture[]>(
    `SELECT * FROM ProfilePictures WHERE profile_picture_id = ?`,
    [profile_picture_id],
  );
  if (rows.length === 0) {
    customLog('getProfilePictureById: Profile picture not found');
    throw new CustomError('Profile picture not found', 404);
  }
  return rows[0];
};

const postProfilePicture = async (
  media: Omit<ProfilePicture, 'profile_picture_id' | 'created_at'>,
): Promise<ProfilePicture> => {
  const {user_id, filename, filesize, media_type} = media;
  const sql = `INSERT INTO ProfilePictures (user_id, filename, filesize, media_type)
       VALUES (?, ?, ?, ?)`;
  const stmt = promisePool.format(sql, [
    user_id,
    filename,
    filesize,
    media_type,
  ]);
  const [result] = await promisePool.execute<ResultSetHeader>(stmt);

  if (result.affectedRows === 0) {
    customLog('postProfilePicture: Failed to post profile picture');
    throw new CustomError('Failed to post profile picture', 500);
  }

  return await getProfilePictureById(result.insertId);
};

const getProfilePicture = async (user_id: number): Promise<ProfilePicture> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & ProfilePicture[]>(
    `
    SELECT
      pp.profile_picture_id,
      pp.user_id,
      pp.filename,
      CONCAT(v.base_url, pp.filename) AS filename
    FROM ProfilePictures pp
    CROSS JOIN (SELECT ? AS base_url) AS v
    WHERE pp.user_id = ?
  `,
    [uploadPath, user_id],
  );

  if (rows.length === 0) {
    customLog('getProfilePicture: Profile picture not found');
    throw new CustomError('Profile picture not found', 404);
  }

  return rows[0];
};

export {
  getUserById,
  getAllUsers,
  getUserByEmail,
  getUserByUsername,
  createUser,
  modifyUser,
  deleteUser,
  getUserByUsernameWithoutPassword,
  getUserBySearch,
  modifyProfileInfo,
  getProfilePictureById,
  postProfilePicture,
  getProfilePicture,
};
