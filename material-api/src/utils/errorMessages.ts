export const ERROR_MESSAGES = {
  MEDIA: {
    NOT_FOUND: 'No media found',
    NOT_FOUND_USER: 'No media found for user',
    NOT_FOUND_LIKED: 'No liked media found',
    NOT_CREATED: 'Failed to create media',
    NOT_UPDATED: 'Media not updated',
    NOT_DELETED: 'Media not deleted',
    NO_ID: 'No id provided',
    INVALID_PAGINATION: 'Invalid pagination parameters',
    INVALID_SEARCH: 'Invalid search parameters',
    INVALID_SEARCH_FIELD: 'Invalid search field',
    NO_USERNAME: 'No username provided',
  },
  LIKE: {
    NOT_FOUND: 'No likes found',
    NOT_FOUND_MEDIA: 'No likes found for media',
    NOT_FOUND_USER: 'No likes found for user',
    NOT_CREATED: 'Like not created',
    NOT_DELETED: 'Like not deleted',
    ALREADY_EXISTS: 'User has already liked this media item',
  },
  TAG: {
    NOT_FOUND: 'No tags found',
    NOT_FOUND_MEDIA: 'No tags found for media',
    NOT_CREATED: 'Tag not created',
    NOT_DELETED: 'Tag not deleted',
    NOT_AUTHORIZED: 'Not authorized to modify tags',
    FILES_NOT_FOUND: 'No files found with this tag',
  },
  RATING: {
    NOT_FOUND: 'No ratings found',
    NOT_FOUND_MEDIA: 'No ratings found for media',
    NOT_FOUND_USER: 'No ratings found for user',
    NOT_CREATED: 'Rating not created',
    NOT_DELETED: 'Rating not deleted',
    NOT_UPDATED: 'Rating not updated',
    ALREADY_EXISTS: 'User has already rated this media item',
  },
  COMMENT: {
    NOT_FOUND: 'No comments found',
    NOT_FOUND_MEDIA: 'No comments found for media',
    NOT_FOUND_USER: 'No comments found for user',
    NOT_CREATED: 'Comment not created',
    NOT_DELETED: 'Comment not deleted',
    NOT_UPDATED: 'Comment not updated',
    NO_ID: 'No comment id provided',
  },
  FOLLOW: {
    NOT_FOUND: 'No follows found',
    NOT_FOUND_USER: 'No follows found for user',
    NOT_CREATED: 'Follow not created',
    NOT_DELETED: 'Follow not deleted',
    ALREADY_EXISTS: 'User is already following this user',
    SELF_FOLLOW: 'User cannot follow themselves',
  },
  NOTIFICATIONS: {
    NOT_FOUND: 'No notifications found',
    NOT_FOUND_USER: 'No notifications found for user',
    NOT_CREATED: 'Notification not created',
    NOT_DELETED: 'Notification not deleted',
  },
  ACTIVITY: {
    NOT_FOUND: 'No activity found',
  },
  FAVORITE: {
    NOT_FOUND: 'No favorites found',
    NOT_FOUND_USER: 'No favorites found for user',
    NOT_CREATED: 'Favorite not created',
    NOT_DELETED: 'Favorite not deleted',
    UNAUTHORIZED: 'User is not authorized to remove this favorite',
    ALREADY_EXISTS: 'User has already favorited this media item',
  },
} as const;
