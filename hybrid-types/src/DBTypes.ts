type UserLevel = {
  level_id: number;
  level_name: 'Admin' | 'User' | 'Guest';
};

type User = {
  user_id: number;
  username: string;
  password: string;
  email: string;
  user_level_id: number;
  created_at: Date | string;
};

type StudyMaterial = {
  material_id: number;
  user_id: number;
  filename: string;
  thumbnail: string | null;
  filesize: number;
  media_type: string;
  title: string;
  description: string | null;
  created_at: Date | string;
  screenshots: string[] | null;
};

type Comment = {
  comment_id: number;
  material_id: number;
  user_id: number;
  comment_text: string;
  created_at: Date;
};

type Like = {
  like_id: number;
  material_id: number;
  user_id: number;
  created_at: Date;
};

type Rating = {
  rating_id: number;
  material_id: number;
  user_id: number;
  rating_value: number;
  created_at: Date;
};

type Tag = {
  tag_id: number;
  tag_name: string;
};

type MaterialTag = {
  material_id: number;
  tag_id: number;
};

type TagResult = MaterialTag & Tag;

type UploadResult = {
  message: string;
  data?: {
    image: string;
  };
};

type MostLikedMedia = Pick<
  StudyMaterial,
  | 'material_id'
  | 'filename'
  | 'filesize'
  | 'media_type'
  | 'title'
  | 'description'
  | 'created_at'
> &
  Pick<User, 'user_id' | 'username' | 'email' | 'created_at'> & {
    likes_count: bigint;
  };

// type gymnastics to get rid of user_level_id from User type and replace it with level_name from UserLevel type
type UserWithLevel = Omit<User, 'user_level_id'> &
  Pick<UserLevel, 'level_name'>;

type UserWithNoPassword = Omit<UserWithLevel, 'password'>;

type TokenContent = Pick<User, 'user_id'> & Pick<UserLevel, 'level_name'>;

type MediaItemWithOwner = StudyMaterial & Pick<User, 'username'>;

// for upload server
type FileInfo = {
  filename: string;
  user_id: number;
};

export type {
  UserLevel,
  User,
  StudyMaterial,
  Comment,
  Like,
  Rating,
  Tag,
  MaterialTag,
  TagResult,
  UploadResult,
  MostLikedMedia,
  UserWithLevel,
  UserWithNoPassword,
  TokenContent,
  MediaItemWithOwner,
  FileInfo,
};
