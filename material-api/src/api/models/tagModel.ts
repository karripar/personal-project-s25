import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {StudyMaterial, Tag, TagResult} from 'hybrid-types/DBTypes';
import promisePool from '../../lib/db';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {ERROR_MESSAGES} from '../../utils/errorMessages';

// Request a list of tags
const fetchAllTags = async (): Promise<Tag[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Tag[]>(
    'SELECT * FROM Tags',
  );
  return rows;
};

const fetchFilesByTagById = async (tag_id: number): Promise<StudyMaterial[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & StudyMaterial[]>(
    `SELECT * FROM MediaItems
     JOIN MaterialTags ON StudyMaterials.material_id = MaterialTags.material_id
     WHERE MaterialTags.tag_id = ?`,
    [tag_id],
  );
  return rows;
};

// Post a new tag
const postTag = async (
  tag_name: string,
  material_id: number,
): Promise<MessageResponse> => {
  let tag_id = 0;
  // check if tag exists (case insensitive)
  const [tagResult] = await promisePool.query<RowDataPacket[] & Tag[]>(
    'SELECT tag_id FROM Tags WHERE tag_name = ?',
    [tag_name],
  );

  if (tagResult.length === 0) {
    // if tag does not exist create it
    const [insertResult] = await promisePool.execute<ResultSetHeader>(
      'INSERT INTO Tags (tag_name) VALUES (?)',
      [tag_name],
    );
    tag_id = insertResult.insertId;
  } else {
    tag_id = tagResult[0].tag_id;
  }

  const [result] = await promisePool.execute<ResultSetHeader>(
    'INSERT INTO MediaItemTags (tag_id, material_id) VALUES (?, ?)',
    [tag_id, material_id],
  );

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.TAG.NOT_CREATED, 500);
  }

  return {message: 'Tag added'};
};

// Request a list of tags by media item id
const fetchTagsByMaterialId = async (id: number): Promise<TagResult[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & TagResult[]>(
    `SELECT Tags.tag_id, Tags.tag_name, MaterialTags.material_id
     FROM Tags
     JOIN MaterialTags ON Tags.tag_id = StudyMaterials.tag_id
     WHERE MaterialTags.material_id = ?`,
    [id],
  );
  return rows;
};

// Delete a tag
const deleteTag = async (id: number): Promise<MessageResponse> => {
  const connection = await promisePool.getConnection();
  await connection.beginTransaction();

  try {
    const [result1] = await connection.execute<ResultSetHeader>(
      'DELETE FROM MaterialTags WHERE tag_id = ?',
      [id],
    );

    const [result2] = await connection.execute<ResultSetHeader>(
      'DELETE FROM Tags WHERE tag_id = ?',
      [id],
    );

    if (result1.affectedRows === 0 && result2.affectedRows === 0) {
      throw new CustomError(ERROR_MESSAGES.TAG.NOT_DELETED, 404);
    }

    await connection.commit();
    return {message: 'Tag deleted'};
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteTagFromMaterial = async (
  tag_id: number,
  material_id: number,
  user_id: number,
): Promise<MessageResponse> => {
  // check if user owns media item
  const [mediaItem] = await promisePool.execute<RowDataPacket[]>(
    'SELECT * FROM StudyMaterials WHERE material_id = ? AND user_id = ?',
    [material_id, user_id],
  );

  if (mediaItem.length === 0) {
    throw new CustomError(ERROR_MESSAGES.TAG.NOT_AUTHORIZED, 401);
  }

  const [result] = await promisePool.execute<ResultSetHeader>(
    'DELETE FROM MaterialTags WHERE tag_id = ? AND material_id = ?',
    [tag_id, material_id],
  );

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.TAG.NOT_DELETED, 404);
  }

  return {message: 'Tag deleted from media item'};
};

export {
  fetchAllTags,
  postTag,
  fetchTagsByMaterialId,
  fetchFilesByTagById,
  deleteTag,
  deleteTagFromMaterial,
};
