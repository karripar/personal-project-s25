import { ErrorResponse } from "hybrid-types/MessageTypes";
import CustomError from "../classes/CustomError";
import { NextFunction } from "express";

const customLog = (message: string) => {
  if (process.env.NODE_ENV === 'dev') {
    console.log(message);
  } else {
    return;
  }
};

const fetchData = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  console.log('fetching data');
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok) {
    const errorJson = json as unknown as ErrorResponse;
    console.log('errorJson', errorJson);
    if (errorJson.message) {
      throw new Error(errorJson.message);
    }
    throw new Error(`Error ${response.status} occured`);
  }
  return json;
};

const handleError = (message: string, status: number, next: NextFunction) => {
  next(new CustomError(message, status));
};


export { customLog, fetchData, handleError };
