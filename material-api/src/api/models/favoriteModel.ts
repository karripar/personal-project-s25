import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Favorite } from 'hybrid-types/DBTypes';
import promisePool from '../../lib/db';
import { MessageResponse } from 'hybrid-types/MessageTypes';
import CustomError from '../../classes/CustomError';
import { ERROR_MESSAGES } from '../../utils/errorMessages';


// Request a list of favorites
const fetchAllFavorites = async (): Promise<Favorite[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Favorite[]>(
    'SELECT * FROM Favorites',
  );
  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.FAVORITE.NOT_FOUND, 404);
  }
  return rows;
};

// Request a list of favorites by user id
const fetchFavoritesByUserId = async (user_id: number): Promise<Favorite[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Favorite[]>(`
    SELECT f.*, m.title, m.description, m.created_at
    FROM Favorites f
    JOIN StudyMaterials m ON f.material_id = m.material_id
    WHERE f.user_id = ?`,
    [user_id],
  );
  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.FAVORITE.NOT_FOUND_USER, 404);
  }
  return rows;
};

// Add a favorite
const addFavorite = async (user_id: number, material_id: number): Promise<MessageResponse> => {
  // Check if the favorite already exists
  const [existing] = await promisePool.execute<RowDataPacket[]>(
    'SELECT * FROM Favorites WHERE user_id = ? AND material_id = ?',
    [user_id, material_id]
  );

  if (existing.length > 0) {
    throw new CustomError(ERROR_MESSAGES.FAVORITE.ALREADY_EXISTS, 400);
  }

  const [result] = await promisePool.execute<ResultSetHeader>(
    'INSERT INTO Favorites (user_id, material_id) VALUES (?, ?)',
    [user_id, material_id],
  );

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.FAVORITE.NOT_CREATED, 500);
  }

  return { message: 'Favorite added' };
};

const countFavorites = async (material_id: number): Promise<number> => {
  const [rows] = await promisePool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM Favorites WHERE material_id = ?',
    [material_id],
  );
  return rows[0].count;
}

// Remove a favorite
const removeFavorite = async (user_id: number, material_id: number): Promise<MessageResponse> => {
  // Check if the favorite exists and belongs to the user
  const [rows] = await promisePool.execute<RowDataPacket[]>(
    'SELECT * FROM Favorites WHERE user_id = ? AND material_id = ?',
    [user_id, material_id],
  );
  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.FAVORITE.UNAUTHORIZED , 404);
  }

  // Proceed to remove the favorite
  const [result] = await promisePool.execute<ResultSetHeader>(
    'DELETE FROM Favorites WHERE user_id = ? AND material_id = ?',
    [user_id, material_id],
  );
  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.FAVORITE.NOT_DELETED, 500);
  }
  return { message: 'Favorite removed' };
};

export {
  fetchAllFavorites,
  fetchFavoritesByUserId,
  addFavorite,
  removeFavorite,
  countFavorites,
};
