import {ERROR_MESSAGES} from '../../utils/errorMessages';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {StudyMaterial, UserLevel} from 'hybrid-types/DBTypes';
import promisePool from '../../lib/db';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {fetchData} from '../../lib/functions';

const uploadPath = process.env.UPLOAD_URL;

// Common SQL fragments
// if mediaItem is an image add '-thumb.png' to filename
// if mediaItem is not image add screenshots property with 5 thumbnails
// uploadPath needs to be passed to the query
// Example usage:
// ....execute(BASE_MEDIA_QUERY, [uploadPath, otherParams]);
const BASE_MEDIA_QUERY = `
  SELECT
    material_id,
    user_id,
    filename,
    filesize,
    media_type,
    title,
    description,
    created_at,
    CONCAT(?, filename) AS filename,
    CASE
      WHEN media_type LIKE '%image%'
      THEN CONCAT(filename, '-thumb.png')
      ELSE NULL
    END AS thumbnail,
    CASE
      WHEN media_type NOT LIKE '%image%'
      THEN (
        SELECT JSON_ARRAYAGG(
          CONCAT(filename, '-thumb-', numbers.n, '.png')
        )
        FROM (
          SELECT 1 AS n UNION SELECT 2 UNION SELECT 3
          UNION SELECT 4 UNION SELECT 5
        ) numbers
      )
      ELSE NULL
    END AS screenshots
  FROM StudyMaterials
`;

const fetchAllMaterial = async (
  page: number | undefined = undefined,
  limit: number | undefined = undefined,
): Promise<StudyMaterial[]> => {
  const offset = ((page || 1) - 1) * (limit || 10);
  const sql = `${BASE_MEDIA_QUERY}
    ${limit ? 'LIMIT ? OFFSET ?' : ''}`;
  const params = [uploadPath, limit, offset];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);

  const [rows] = await promisePool.execute<RowDataPacket[] & StudyMaterial[]>(stmt);
  return rows;
};

const fetchMaterialById = async (id: number): Promise<StudyMaterial> => {
  const sql = `${BASE_MEDIA_QUERY}
              WHERE material_id=?`;
  const params = [uploadPath, id];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);
  const [rows] = await promisePool.execute<RowDataPacket[] & StudyMaterial[]>(stmt);
  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND, 404);
  }
  return rows[0];
};

const postMaterial = async (
  media: Omit<StudyMaterial, 'material_id' | 'created_at' | 'thumbnail'>,
): Promise<StudyMaterial> => {
  const {user_id, filename, filesize, media_type, title, description} = media;
  const sql = `INSERT INTO StudyMaterials (user_id, filename, filesize, media_type, title, description)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [user_id, filename, filesize, media_type, title, description];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);
  const [result] = await promisePool.execute<ResultSetHeader>(stmt);
  console.log('postMedia', result);
  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_CREATED, 500);
  }
  return await fetchMaterialById(result.insertId);
};

const putMaterial = async (
  material: Pick<StudyMaterial, 'title' | 'description'>,
  id: number,
  user_id: number,
  user_level: UserLevel['level_name'],
): Promise<StudyMaterial> => {
  const sql =
    user_level === 'Admin'
      ? 'UPDATE StudyMaterials SET title = ?, description = ? WHERE material_id = ?'
      : 'UPDATE StudyMaterials SET title = ?, description = ? WHERE material_id = ? AND user_id = ?';

  const params =
    user_level === 'Admin'
      ? [material.title, material.description, id]
      : [material.title, material.description, id, user_id];

  const stmt = promisePool.format(sql, params);
  const [result] = await promisePool.execute<ResultSetHeader>(stmt);

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_UPDATED, 404);
  }

  return await fetchMaterialById(id);
};

const deleteMaterial = async (
  material_id: number,
  user_id: number,
  token: string,
  level_name: UserLevel['level_name'],
): Promise<MessageResponse> => {
  const material = await fetchMaterialById(material_id);

  if (!material) {
    return {message: 'Media not found'};
  }

  material.filename = material?.filename.replace(
    process.env.UPLOAD_URL as string,
    '',
  );

  const connection = await promisePool.getConnection();

  await connection.beginTransaction();

  await connection.execute('DELETE FROM Likes WHERE material_id = ?;', [material_id]);

  await connection.execute('DELETE FROM Comments WHERE material_id = ?;', [
    material_id,
  ]);

  await connection.execute('DELETE FROM Ratings WHERE material_id = ?;', [
    material_id,
  ]);

  await connection.execute('DELETE FROM MaterialTags WHERE material_id = ?;', [
    material_id,
  ]);

  const sql =
    level_name === 'Admin'
      ? connection.format('DELETE FROM StudyMaterials WHERE material_id = ?', [
        material_id,
        ])
      : connection.format(
          'DELETE FROM StudyMaterials WHERE material_id = ? AND user_id = ?',
          [material_id, user_id],
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
      `${process.env.UPLOAD_SERVER}/delete/${material.filename}`,
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

const fetchMaterialByUserId = async (user_id: number): Promise<StudyMaterial[]> => {
  const sql = `${BASE_MEDIA_QUERY} WHERE user_id = ?`;
  const params = [uploadPath, user_id];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);

  const [rows] = await promisePool.execute<RowDataPacket[] & StudyMaterial[]>(stmt);
  return rows;
};

const fetchMostLikedMaterial = async (): Promise<StudyMaterial> => {
  // you could also use a view for this
  const sql = `${BASE_MEDIA_QUERY}
     WHERE material_id = (
       SELECT material_id FROM Likes
       GROUP BY material_id
       ORDER BY COUNT(*) DESC
       LIMIT 1
     )`;
  const params = [uploadPath];
  const stmt = promisePool.format(sql, params);
  console.log(stmt);

  const [rows] = await promisePool.execute<
    RowDataPacket[] & StudyMaterial[] & {likes_count: number}
  >(stmt);

  if (!rows.length) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND_LIKED, 404);
  }
  return rows[0];
};

export {
  fetchAllMaterial,
  fetchMaterialById,
  postMaterial,
  deleteMaterial,
  fetchMostLikedMaterial,
  fetchMaterialByUserId,
  putMaterial,
};
