import {ERROR_MESSAGES} from '../../utils/errorMessages';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {MediaItem, UserLevel} from 'hybrid-types/DBTypes';
import promisePool from '../../lib/db';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {fetchData} from '../../lib/functions';
const uploadPath = process.env.UPLOAD_URL;

const BASE_MEDIA_QUERY = `
  SELECT
    mi.media_id,
    mi.user_id,
    mi.filename,
    mi.filesize,
    mi.media_type,
    mi.title,
    mi.description,
    mi.created_at,
    CONCAT(v.base_url, mi.filename) AS filename,
    CASE
      WHEN mi.media_type LIKE '%image%'
      THEN CONCAT(v.base_url, mi.filename, '-thumb.png')
      ELSE CONCAT(v.base_url, mi.filename, '-animation.gif')
    END AS thumbnail,
    CASE
      WHEN mi.media_type NOT LIKE '%image%'
      THEN JSON_ARRAY(
          CONCAT(v.base_url, mi.filename, '-thumb-1.png'),
          CONCAT(v.base_url, mi.filename, '-thumb-2.png'),
          CONCAT(v.base_url, mi.filename, '-thumb-3.png'),
          CONCAT(v.base_url, mi.filename, '-thumb-4.png'),
          CONCAT(v.base_url, mi.filename, '-thumb-5.png')
        )
      ELSE NULL
    END AS screenshots
FROM MediaItems mi
CROSS JOIN (SELECT ? AS base_url) AS v
`;

const fetchAllMedia = async (
  page: number | undefined = undefined,
  limit: number | undefined = undefined,
): Promise<MediaItem[]> => {
  const offset = ((page || 1) - 1) * (limit || 10);
  const sql = `${BASE_MEDIA_QUERY}
    ${limit ? 'LIMIT ? OFFSET ?' : ''}`;
  const params = [uploadPath, limit, offset];
  console.log('Uploads fetch: ', uploadPath);
  const stmt = promisePool.format(sql, params);
  console.log(stmt);

  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(stmt);
  return rows;
};

const fetchMediaById = async (id: number): Promise<MediaItem> => {
  const sql = `${BASE_MEDIA_QUERY}
              WHERE media_id = ?`;
  const params = [uploadPath, id];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);
  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(stmt);
  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND, 404);
  }
  return rows[0];
};

const postMedia = async (
  media: Omit<MediaItem, 'media_id' | 'created_at' | 'thumbnail'>,
): Promise<MediaItem> => {
  const {user_id, filename, filesize, media_type, title, description} = media;
  const sql = `INSERT INTO MediaItems (user_id, filename, filesize, media_type, title, description)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [user_id, filename, filesize, media_type, title, description];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);
  const [result] = await promisePool.execute<ResultSetHeader>(stmt);
  console.log('postMedia', result);
  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_CREATED, 500);
  }
  return await fetchMediaById(result.insertId);
};

const putMedia = async (
  Media: Pick<MediaItem, 'title' | 'description'>,
  id: number,
  user_id: number,
  user_level: UserLevel['level_name'],
): Promise<MediaItem> => {
  const sql =
    user_level === 'Admin'
      ? 'UPDATE MediaItems SET title = ?, description = ? WHERE media_id = ?'
      : 'UPDATE MediaItems SET title = ?, description = ? WHERE media_id = ? AND user_id = ?';

  const params =
    user_level === 'Admin'
      ? [Media.title, Media.description, id]
      : [Media.title, Media.description, id, user_id];

  const stmt = promisePool.format(sql, params);
  const [result] = await promisePool.execute<ResultSetHeader>(stmt);

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_UPDATED, 404);
  }

  return await fetchMediaById(id);
};

const deleteMedia = async (
  media_id: number,
  user_id: number,
  token: string,
  level_name: UserLevel['level_name'],
): Promise<MessageResponse> => {
  const Media = await fetchMediaById(media_id);

  if (!Media) {
    return {message: 'Media not found'};
  }

  Media.filename = Media?.filename.replace(
    process.env.UPLOAD_URL as string,
    '',
  );

  const connection = await promisePool.getConnection();

  await connection.beginTransaction();

  await connection.execute('DELETE FROM Likes WHERE media_id = ?;', [media_id]);

  await connection.execute('DELETE FROM Comments WHERE media_id = ?;', [
    media_id,
  ]);

  await connection.execute('DELETE FROM MediaTags WHERE media_id = ?;', [
    media_id,
  ]);

  const sql =
    level_name === 'Admin'
      ? connection.format('DELETE FROM MediaItems WHERE media_id = ?', [
          media_id,
        ])
      : connection.format(
          'DELETE FROM MediaItems WHERE media_id = ? AND user_id = ?',
          [media_id, user_id],
        );

  const [result] = await connection.execute<ResultSetHeader>(sql);

  if (result.affectedRows === 0) {
    return {message: 'Media not deleted'};
  }

  const options = {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  try {
    const deleteResult = await fetchData<MessageResponse>(
      `${process.env.UPLOAD_SERVER}/delete/${Media.filename}`,
      options,
    );

    console.log('deleteResult', deleteResult);
  } catch (e) {
    console.error('deleteMedia file delete error:', (e as Error).message);
  }

  await connection.commit();

  return {
    message: 'Media deleted',
  };
};

const fetchMediaByUserId = async (user_id: number): Promise<MediaItem[]> => {
  console.log('user_id', user_id);

  if (!user_id) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND, 404);
  }

  if (!uploadPath) {
    throw new CustomError('Upload path is missing', 500);
  }

  const sql = `${BASE_MEDIA_QUERY} WHERE mi.user_id = ?`;
  const params = [uploadPath, user_id];

  console.log('Executing SQL:', promisePool.format(sql, params)); // Debugging

  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(
    sql,
    params,
  );
  return rows;
};

const fetchMediaByUsername = async (username: string): Promise<MediaItem[]> => {
  const sql = `${BASE_MEDIA_QUERY} WHERE user_id = (SELECT user_id FROM Users WHERE username = ?)`;
  const params = [uploadPath, username];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);

  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(stmt);
  if (!rows.length) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND, 404);
  }
  return rows;
};

const fetchMostLikedMedia = async (): Promise<MediaItem> => {
  // you could also use a view for this
  const sql = `${BASE_MEDIA_QUERY}
     WHERE media_id = (
       SELECT media_id FROM Likes
       GROUP BY media_id
       ORDER BY COUNT(*) DESC
       LIMIT 1
     )`;
  const params = [uploadPath];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);

  const [rows] = await promisePool.execute<
    RowDataPacket[] & MediaItem[] & {likes_count: number}
  >(stmt);

  if (!rows.length) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND_LIKED, 404);
  }
  return rows[0];
};

const fetchFollowedMedia = async (user_id: number): Promise<MediaItem[]> => {
  const sql = `SELECT * FROM FollowedMedias WHERE follower_id = ?`;
  const params = [user_id];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);

  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(stmt);
  if (!rows.length) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND, 404);
  }
  return rows;
};

const fetchSearchedMedia = async (
  search: string,
  searchBy: string,
  page: number = 1,
  limit: number = 10,
): Promise<MediaItem[]> => {
  const offset = (page - 1) * limit;

  // Allowed search fields
  const allowedFields: Record<string, string> = {
    title: 'mi.title',
    description: 'mi.description',
    tags: 't.tag_name',
  };

  if (!allowedFields[searchBy]) {
    throw new Error(
      'Invalid searchBy value. Allowed values: title, description, tags.',
    );
  }

  let sql: string;
  // Default to empty string if uploadPath is undefined
  const uploadPathFallback = uploadPath || '';

  const params: (string | number)[] = [uploadPathFallback]; // Fallback value

  if (searchBy === 'tags') {
    sql = `${BASE_MEDIA_QUERY}
      JOIN MediaTags mt ON mi.media_id = mt.media_id
      JOIN Tags t ON mt.tag_id = t.tag_id
      WHERE LOWER(t.tag_name) = LOWER(?)
      ${limit ? 'LIMIT ? OFFSET ?' : ''}`;
    params.push(search.toLowerCase()); // Ensure the search term is in lowercase
  } else {
    sql = `${BASE_MEDIA_QUERY}
      WHERE LOWER(${allowedFields[searchBy]}) LIKE LOWER(?)
      ${limit ? 'LIMIT ? OFFSET ?' : ''}`;
    params.push(`%${search}%`);
  }

  if (limit) {
    params.push(limit, offset);
  }

  const stmt = promisePool.format(sql, params);
  console.log(stmt); // Debugging

  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(stmt);
  return rows;
};

const fetchMediaByTagname = async (tagname: string): Promise<MediaItem[]> => {
  const sql = `${BASE_MEDIA_QUERY}
    JOIN MediaTags mt ON mi.media_id = mt.media_id
    JOIN Tags t ON mt.tag_id = t.tag_id
    WHERE LOWER(t.tag_name) = LOWER(?)`; // Convert both to lowercase

  const params = [uploadPath, tagname.toLowerCase()]; // Ensure lowercase input
  const stmt = promisePool.format(sql, params);
  console.log(stmt); // Debugging

  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(stmt);
  return rows;
};

export {
  fetchAllMedia,
  fetchMediaById,
  postMedia,
  deleteMedia,
  fetchMostLikedMedia,
  fetchMediaByUserId,
  putMedia,
  fetchFollowedMedia,
  fetchSearchedMedia,
  fetchMediaByUsername,
  fetchMediaByTagname,
};
