-- source c:/users/karri/WebDev/personal-project-s25/mylens.sql
DROP DATABASE IF EXISTS mylens;
CREATE DATABASE mylens;
USE mylens;

-- Create UserLevels table
CREATE TABLE UserLevels (
    user_level_id INT PRIMARY KEY AUTO_INCREMENT,
    level_name VARCHAR(50) NOT NULL UNIQUE
);

-- Create Users table
CREATE TABLE Users (
    user_id INT PRIMARY KEY UNIQUE AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    bio TEXT,
    user_level_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_level_id) REFERENCES UserLevels(user_level_id)
);


-- Create ProfilePictures table
CREATE TABLE ProfilePictures (
    profile_picture_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    filesize INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create MediaItems table
CREATE TABLE MediaItems (
    media_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255),
    filesize INT NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Tags table
CREATE TABLE Tags (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) NOT NULL UNIQUE
);

-- Create MediaTags table
CREATE TABLE MediaTags (
    media_tag_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);

-- Create Comments table
CREATE TABLE Comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    reference_comment_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reference_comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE
);

-- Create Likes table
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

-- Create Follows table
CREATE TABLE Follows (
    follow_id INT PRIMARY KEY AUTO_INCREMENT,
    follower_id INT NOT NULL,
    followed_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create NotificationTypes table
CREATE TABLE NotificationTypes (
    notification_type_id INT PRIMARY KEY AUTO_INCREMENT,
    notification_type_name VARCHAR(50) NOT NULL UNIQUE
);

-- Create Notifications table
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

-- Create Favorites table
CREATE TABLE Favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    media_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE
);

-- Create Views for reporting and aggregation
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
    COUNT(DISTINCT Comments.comment_id) AS comment_count
FROM Users
LEFT JOIN MediaItems ON Users.user_id = MediaItems.user_id
LEFT JOIN Comments ON Users.user_id = Comments.user_id
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

CREATE VIEW MediaWithTags AS
SELECT 
    MediaItems.media_id,
    MediaItems.user_id,
    MediaItems.filename,
    MediaItems.thumbnail,
    MediaItems.filesize,
    MediaItems.media_type,
    MediaItems.title,
    MediaItems.description,
    MediaItems.created_at,
    GROUP_CONCAT(Tags.tag_name ORDER BY Tags.tag_name SEPARATOR ', ') AS tags
FROM MediaItems
LEFT JOIN MediaTags ON MediaItems.media_id = MediaTags.media_id
LEFT JOIN Tags ON MediaTags.tag_id = Tags.tag_id
GROUP BY MediaItems.media_id;

-- Scheduled Event for Notifications
CREATE EVENT ArchiveOldNotifications
ON SCHEDULE EVERY 1 DAY
DO
UPDATE Notifications 
SET is_archived = TRUE 
WHERE is_read = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Create Indexes
CREATE INDEX idx_notifications_user_id ON Notifications(user_id);
CREATE INDEX idx_is_read ON Notifications(is_read);
CREATE FULLTEXT INDEX idx_ft_title ON MediaItems(title, description);
CREATE UNIQUE INDEX idx_unique_follow ON Follows(follower_id, followed_id);

-- Sample Data Insertion
INSERT INTO UserLevels (level_name) VALUES ('Admin'), ('User');
INSERT INTO Tags (tag_name) VALUES ('tag1'), ('tag2'), ('tag3'), ('tag4'), ('tag5');
INSERT INTO NotificationTypes (notification_type_name) VALUES ('Like'), ('Comment'), ('Follow');

INSERT INTO Users (username, password_hash, email, bio, user_level_id) VALUES ('testuser1', 'SALAsana123', 'testi@gmail.com', 'This is a test user', 2), ('testuser2', 'SALAsana123', 'testi2@gmail.com', 'This is a test user', 2), ('testuser3', 'SALAsana123', 'testi3gmail.com', 'This is a test user', 2),
('admin', 'SALAsana123', 'admin@gmail.com', 'This is an admin user', 1);