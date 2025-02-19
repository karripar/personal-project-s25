
-- source c:/users/karri/WebDev/personal-project-s25/wildlens.sql
DROP DATABASE IF EXISTS wildlens;
CREATE DATABASE wildlens;
USE wildlens;

-- user levels to differentiate between regular users and admins, etc.
CREATE TABLE UserLevels (
    user_level_id INT PRIMARY KEY AUTO_INCREMENT,
    level_name VARCHAR(50) NOT NULL UNIQUE
);

-- coordinates for media to store location information
CREATE TABLE Coordinates (
    coordinates_id INT PRIMARY KEY AUTO_INCREMENT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(255)
);

-- users of the application
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    bio TEXT,
    user_level_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_level_id) REFERENCES UserLevels(user_level_id)
);

-- media that users can upload and share (pdf, doc, etc.)
CREATE TABLE MediaItems (
    media_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255),
    filesize INT NOT NULL,
    coordinates_id INT,
    media_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (coordinates_id) REFERENCES Coordinates(coordinates_id) ON DELETE SET NULL
);

-- tags for media
CREATE TABLE Tags (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) NOT NULL UNIQUE
);

-- media-tag relations
CREATE TABLE MediaTags (
    media_tag_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);

-- comments on media
CREATE TABLE Comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- likes (for media and comments)
CREATE TABLE Likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT,
    comment_id INT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- users rating media between 1 and 5 stars
CREATE TABLE Ratings (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    rating_value INT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- user follow system
CREATE TABLE Follows (
    follow_id INT PRIMARY KEY AUTO_INCREMENT,
    follower_id INT NOT NULL,
    followed_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE NotificationTypes (
    notification_type_id INT PRIMARY KEY AUTO_INCREMENT,
    notification_type_name VARCHAR(50) NOT NULL UNIQUE
);

-- user notifications
CREATE TABLE Notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type_id INT NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (notification_type_id) REFERENCES NotificationTypes(notification_type_id)
);

CREATE TABLE Favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    media_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE
);

-- Views
CREATE VIEW MediaRatings AS
SELECT 
    MediaItems.media_id,
    MediaItems.title,
    AVG(Ratings.rating_value) AS avg_rating
FROM MediaItems
LEFT JOIN Ratings ON MediaItems.media_id = Ratings.media_id
GROUP BY MediaItems.media_id;

CREATE VIEW MediaComments AS
SELECT 
    MediaItems.media_id,
    MediaItems.title,
    COUNT(Comments.comment_id) AS comment_count
FROM MediaItems
LEFT JOIN Comments ON MediaItems.media_id = Comments.media_id
GROUP BY MediaItems.media_id;

CREATE VIEW UserActivity AS
SELECT 
    Users.user_id,
    Users.username,
    COUNT(DISTINCT MediaItems.media_id) AS media_count,
    COUNT(DISTINCT Comments.comment_id) AS comment_count,
    COUNT(DISTINCT Ratings.rating_id) AS rating_count
FROM Users
LEFT JOIN MediaItems ON Users.user_id = MediaItems.user_id
LEFT JOIN Comments ON Users.user_id = Comments.user_id
LEFT JOIN Ratings ON Users.user_id = Ratings.user_id
GROUP BY Users.user_id;

CREATE VIEW FollowedMedia AS 
SELECT 
    mi.media_id,
    mi.user_id AS author_id,
    f.follower_id AS follower_id,
    mi.filename,
    mi.filesize,
    mi.media_type,
    mi.title,
    mi.description,
    mi.created_at
FROM MediaItems mi
JOIN Follows f ON mi.user_id = f.followed_id;

-- Scheduled Event for Notifications
CREATE EVENT ArchiveOldNotifications
ON SCHEDULE EVERY 1 DAY
DO
UPDATE Notifications 
SET is_archived = TRUE 
WHERE is_read = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Indexes
CREATE INDEX idx_media_id ON Ratings(media_id);
CREATE INDEX idx_ratings_user_id ON Ratings(user_id);
CREATE INDEX idx_notifications_user_id ON Notifications(user_id);
CREATE INDEX idx_is_read ON Notifications(is_read);
CREATE FULLTEXT INDEX idx_ft_title ON MediaItems(title, description);
CREATE UNIQUE INDEX idx_unique_follow ON Follows(follower_id, followed_id);

-- Sample Data

INSERT INTO UserLevels (level_name) VALUES ('Admin'), ('User');

INSERT INTO Coordinates (latitude, longitude, location_name) VALUES (40.7128, -74.0060, 'New York City'),
(34.0522, -118.2437, 'Los Angeles'), (41.8781, -87.6298, 'Chicago'),
(29.7604, -95.3698, 'Houston'), (33.4484, -112.0740, 'Phoenix'),
(39.7392, -104.9903, 'Denver'), (42.3601, -71.0589, 'Boston'),
(37.7749, -122.4194, 'San Francisco'), (47.6062, -122.3321, 'Seattle'),
(35.2271, -80.8431, 'Charlotte');

INSERT INTO Users (username, password_hash, email, bio, user_level_id) VALUES ('admin', 'password', 'admin@example.com', 'I am the admin', 2),
('user1', 'password', 'user1@example.com', 'I am user 1', 1),
('user2', 'password', 'user2@example.com', 'I am user 2', 1),
('user3', 'password', 'user3@example.com', 'I am user 3', 1),
('user4', 'password', 'user4@example.com', 'I am user 4', 1),
('user5', 'password', 'user5@example.com', 'I am user 5', 1);

INSERT INTO MediaItems (user_id, filename, thumbnail, filesize, coordinates_id, media_type, title, description) VALUES 
(1, 'media1.pdf', 'media1_thumb.jpg', 1024, 1, 'pdf', 'Media 1', 'This is the first media item'),
(2, 'media2.pdf', 'media2_thumb.jpg', 2048, 2, 'pdf', 'Media 2', 'This is the second media item'),
(3, 'media3.pdf', 'media3_thumb.jpg', 3072, 3, 'pdf', 'Media 3', 'This is the third media item'),
(4, 'media4.pdf', 'media4_thumb.jpg', 4096, 4, 'pdf', 'Media 4', 'This is the fourth media item'),
(5, 'media5.pdf', 'media5_thumb.jpg', 5120, 5, 'pdf', 'Media 5', 'This is the fifth media item');

INSERT INTO Tags (tag_name) VALUES ('tag1'), ('tag2'), ('tag3'), ('tag4'), ('tag5');

INSERT INTO MediaTags (media_id, tag_id) VALUES (1, 1), (1, 2), (2, 2), (2, 3), (3, 3), (3, 4), (4, 4), (4, 5), (5, 5), (5, 1);

INSERT INTO Comments (media_id, user_id, comment) VALUES (1, 2, 'This is a comment on media 1 by user 2'),
(1, 3, 'This is a comment on media 1 by user 3'), (2, 3, 'This is a comment on media 2 by user 3'),
(3, 4, 'This is a comment on media 3 by user 4'), (4, 5, 'This is a comment on media 4 by user 5'),
(5, 2, 'This is a comment on media 5 by user 2');

INSERT INTO Likes (media_id, user_id) VALUES (1, 3), (1, 4), (2, 4), (3, 5), (4, 2), (5, 3);

INSERT INTO Ratings (media_id, user_id, rating_value) VALUES (1, 3, 5), (1, 4, 4), (2, 4, 3), (3, 5, 2), (4, 2, 1), (5, 3, 5);

INSERT INTO Follows (follower_id, followed_id) VALUES (2, 1), (3, 1), (4, 1), (5, 1);

INSERT INTO NotificationTypes (notification_type_name) VALUES ('Like'), ('Comment'), ('Follow');

INSERT INTO Notifications (user_id, notification_text, notification_type_id) VALUES (1, 'User 3 liked your media item', 1),
(1, 'User 4 liked your media item', 1), (1, 'User 3 commented on your media item', 2),
(1, 'User 4 commented on your media item', 2), (1, 'User 2 followed you', 3), (1, 'User 3 followed you', 3),
(1, 'User 4 followed you', 3), (1, 'User 5 followed you', 3);

INSERT INTO Favorites (user_id, media_id) VALUES (2, 1), (2, 2), (2, 3), (2, 4), (2, 5);



