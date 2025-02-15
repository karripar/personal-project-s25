DROP DATABASE IF EXISTS wildlens;

CREATE DATABASE wildlens;
USE wildlens;

-- tables --

-- source c:/users/karri/WebDev/personal-project-s25/wildlens.sql

-- user levels to differentiate between regular users and admins, etc.
CREATE TABLE UserLevels (
    user_level_id INT PRIMARY KEY AUTO_INCREMENT,
    level_name VARCHAR(50) NOT NULL UNIQUE
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


-- media that users can upload and share with others (pdf, doc, etc.)
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


-- coordinates for media to store location information
CREATE TABLE Coordinates (
    coordinates_id INT PRIMARY KEY AUTO_INCREMENT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(255)
);


-- tags for media to categorize them and make them easier to find
CREATE TABLE Tags (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) NOT NULL UNIQUE
);


-- media tags 
CREATE TABLE MediaTags (
    media_tag_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);



-- users can add comments to media to discuss them
CREATE TABLE Comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


-- likes for posts, comments, etc.
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



-- users can rate media between 1 and 5 stars
CREATE TABLE Ratings (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    rating_value INT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- users can follow each other to get notifications about new media, comments, etc.
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

-- notifications for users, when someone follows them, comments on their media, etc.
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


-- views --

-- average rating for a media
CREATE VIEW MediaRatings AS
SELECT
    MediaItems.media_id,
    MediaItems.title,
    AVG(Ratings.rating_value) AS avg_rating
FROM MediaItems
LEFT JOIN Ratings ON MediaItems.media_id = Ratings.media_id
GROUP BY MediaItems.media_id;


-- List of media with number of comments
CREATE VIEW MediaComments AS
SELECT 
    MediaItems.media_id,
    MediaItems.title,
    COUNT(Comments.comment_id) AS comment_count
FROM MediaItems
LEFT JOIN Comments ON MediaItems.media_id = Comments.media_id
GROUP BY MediaItems.media_id;


-- User activity with number of media, comments, and ratings
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


-- User notifications with number of unread notifications
CREATE VIEW UserNotifications AS
SELECT 
    Users.user_id,
    Users.username,
    COUNT(Notifications.notification_id) AS notification_count,
    COUNT(CASE WHEN Notifications.is_read = FALSE THEN 1 ELSE NULL END) AS unread_count
FROM Users
LEFT JOIN Notifications ON Users.user_id = Notifications.user_id
GROUP BY Users.user_id;


-- view to get the latest notifications for a user
CREATE VIEW LatestNotifications AS
SELECT 
    Notifications.notification_id,
    Notifications.user_id,
    Notifications.notification_text,
    NotificationTypes.notification_type_name, -- Fixed column reference
    Notifications.is_read,
    Notifications.created_at,
    Users.username
FROM Notifications
JOIN Users ON Notifications.user_id = Users.user_id
JOIN NotificationTypes ON Notifications.notification_type_id = NotificationTypes.notification_type_id -- Fix
ORDER BY Notifications.created_at DESC;


-- view to get the latest media uploaded by users
CREATE VIEW LatestMedia AS
SELECT 
    MediaItems.media_id,
    MediaItems.title,
    MediaItems.user_id,
    MediaItems.description,
    MediaItems.created_at,
    Users.username
FROM MediaItems
JOIN Users ON MediaItems.user_id = Users.user_id
ORDER BY MediaItems.created_at DESC;


-- view to get the media from a user that is followed by the current user
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
JOIN Follows f ON sm.user_id = f.followed_id;



-- events --

-- event for archiving read notifications older than 30 days
CREATE EVENT ArchiveOldNotifications
ON SCHEDULE EVERY 1 DAY
DO
UPDATE Notifications 
SET is_archived = TRUE 
WHERE is_read = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);


-- indexes --


CREATE INDEX idx_media_id ON Ratings(media_id);
CREATE INDEX idx_ratings_user_id ON Ratings(user_id);

CREATE INDEX idx_notifications_user_id ON Notifications(user_id);

CREATE INDEX idx_is_read ON Notifications(is_read);

-- full-text search index
CREATE FULLTEXT INDEX idx_ft_title ON MediaItems(title, description);

-- unique indexes
CREATE UNIQUE INDEX idx_username ON Users(username);

-- composite indexes
CREATE INDEX idx_media_user ON Ratings(media_id, user_id);
CREATE INDEX idx_user_read ON Notifications(user_id, is_read);

-- index for read notifications to improve performance of queries
CREATE INDEX idx_notifications_read_created On Notifications(is_read, created_at);

CREATE UNIQUE INDEX idx_unique_follow ON Follows(follower_id, followed_id);


-- Sample data --

INSERT INTO UserLevels (level_name) VALUES ('Admin'), ('User');

INSERT INTO Users (username, password_hash, email, bio, user_level_id) VALUES
('JohnDoe', 'to-be-hashed-pw1', 'johndoe@example.com', 'Tech enthusiast.', 2),
('JaneSmith', 'to-be-hashed-pw2', 'janesmith@example.com', 'Math lover.', 2),
('AdminUser', 'to-be-hashed-pw3', 'adminuser@example.com', 'Site admin.', 1),
('AliceBrown', 'to-be-hashed-pw4', 'alicebrown@example.com', 'Aspiring data scientist.', 2),
('BobWhite', 'to-be-hashed-pw5', 'bobwhite@example.com', 'AI and ML enthusiast.', 2),
('CharlieGreen', 'to-be-hashed-pw6', 'charliegreen@example.com', 'Passionate about cybersecurity.', 2),
('DavidBlack', 'to-be-hashed-pw7', 'davidblack@example.com', 'Full-stack web developer.', 2),
('EveBlue', 'to-be-hashed-pw8', 'eveblue@example.com', 'Quantum computing geek.', 2);


-- mock data for mediaitems where users have posted wildlife photos/videos etc. with coordinates
INSERT INTO Coordinates (latitude, longitude, location_name) VALUES
(37.7749, -122.4194, 'San Francisco, CA'),
(34.0522, -118.2437, 'Los Angeles, CA'),
(40.7128, -74.0060, 'New York, NY'),
(41.8781, -87.6298, 'Chicago, IL'),
(29.7604, -95.3698, 'Houston, TX'),
(33.4484, -112.0740, 'Phoenix, AZ'),
(32.7157, -117.1611, 'San Diego, CA'),
(30.2672, -97.7431, 'Austin, TX');


INSERT INTO MediaItems (user_id, filename, thumbnail, filesize, coordinates_id, media_type, title, description) VALUES
(1, 'wildlife1.jpg', 'wildlife1_thumb.jpg', 1024, 1, 'image', 'Wildlife in San Francisco', 'Beautiful wildlife in San Francisco.'),
(2, 'wildlife2.jpg', 'wildlife2_thumb.jpg', 2048, 2, 'image', 'Wildlife in Los Angeles', 'Wildlife in Los Angeles.'),
(3, 'wildlife3.jpg', 'wildlife3_thumb.jpg', 3072, 3, 'image', 'Wildlife in New York', 'Wildlife in New York.'),
(4, 'wildlife4.jpg', 'wildlife4_thumb.jpg', 4096, 4, 'image', 'Wildlife in Chicago', 'Wildlife in Chicago.'),
(5, 'wildlife5.jpg', 'wildlife5_thumb.jpg', 5120, 5, 'image', 'Wildlife in Houston', 'Wildlife in Houston.'),
(6, 'wildlife6.jpg', 'wildlife6_thumb.jpg', 6144, 6, 'image', 'Wildlife in Phoenix', 'Wildlife in Phoenix.'),
(7, 'wildlife7.jpg', 'wildlife7_thumb.jpg', 7168, 7, 'image', 'Wildlife in San Diego', 'Wildlife in San Diego.'),
(8, 'wildlife8.jpg', 'wildlife8_thumb.jpg', 8192, 8, 'image', 'Wildlife in Austin', 'Wildlife in Austin.');


-- Tags for wildlife photos
INSERT INTO Tags (tag_name) VALUES ('Wildlife'), ('Nature'), ('Animals'), ('Birds'), ('Plants'), ('Insects'), ('Reptiles'), ('Mammals');

-- Assign tags to media items
INSERT INTO MediaTags (media_id, tag_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(3, 1),
(3, 2),
(3, 3),
(3, 4),
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(5, 1),
(5, 2),
(5, 3),
(5, 4),
(6, 1),
(6, 2),
(6, 3),
(6, 4),
(7, 1),
(7, 2),
(7, 3),
(7, 4),
(8, 1),
(8, 2),
(8, 3),
(8, 4);

INSERT INTO Ratings (media_id, user_id, rating_value) VALUES
(1, 2, 5),
(1, 3, 4),
(2, 1, 4),
(3, 2, 5);

INSERT INTO Follows (follower_id, followed_id) VALUES
(1, 2),
(1, 3),
(2, 1),
(3, 1),
(3, 2),
(2, 3),
(4, 1),
(4, 2),
(4, 3),
(5, 1),
(5, 2),
(5, 3),
(6, 1),
(6, 2),
(7, 1),
(7, 2),
(7, 3),
(8, 1),
(8, 2),
(8, 3),
(6, 3);

-- Notification types
INSERT INTO NotificationTypes (notification_type_name) VALUES ('Follow'), ('Comment'), ('Rating'), ('Event');

-- Sample notifications for testing
INSERT INTO Notifications (user_id, notification_text, notification_type_id) VALUES
(2, 'JohnDoe started following you.', 1),
(3, 'JohnDoe started following you.', 1),
(1, 'JaneSmith started following you.', 1),
(1, 'JaneSmith started following you.', 1),
(1, 'JaneSmith commented on your media.', 2),
(1, 'JaneSmith rated your media.', 3),
(2, 'JohnDoe commented on your media.', 2),
(2, 'JohnDoe rated your media.', 3),
(3, 'JaneSmith commented on your media.', 2),
(3, 'JaneSmith rated your media.', 3),
(1, 'JaneSmith commented on your media.', 2),
(1, 'JaneSmith rated your media.', 3),
(1, 'JaneSmith commented on your media.', 2),
(1, 'JaneSmith rated your media.', 3);


-- Sample favorites
INSERT INTO Favorites (user_id, media_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 1),
(2, 2),
(2, 3),
(3, 1),
(3, 2),
(3, 3),
(4, 1),
(4, 2),
(4, 3);



