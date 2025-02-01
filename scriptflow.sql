DROP DATABASE IF EXISTS scriptflow;

CREATE DATABASE scriptflow;
USE scriptflow;

-- tables --

-- source c:/users/karri/onedrive/documents/hybrid-applications/personal-project/scriptflow.sql

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
    study_field VARCHAR(100),
    user_level_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_level_id) REFERENCES UserLevels(user_level_id) 
);


-- materials that users can upload and share with others (pdf, doc, etc.)
CREATE TABLE StudyMaterials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
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


-- tags for materials to categorize them and make them easier to find
CREATE TABLE Tags (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) NOT NULL UNIQUE
);


-- material tags 
CREATE TABLE MaterialTags (
    material_tag_id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (material_id) REFERENCES StudyMaterials(material_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);



-- users can add comments to materials to discuss them
CREATE TABLE Comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES StudyMaterials(material_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


-- likes for posts, comments, etc.
CREATE TABLE Likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT,
    comment_id INT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES StudyMaterials(material_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);



-- users can rate materials between 1 and 5 stars
CREATE TABLE Ratings (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    user_id INT NOT NULL,
    rating_value INT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES StudyMaterials(material_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- users can follow each other to get notifications about new materials, comments, etc.
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

-- notifications for users, when someone follows them, comments on their material, etc.
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


-- views --

-- average rating for a material
CREATE VIEW MaterialRatings AS
SELECT
    StudyMaterials.material_id,
    StudyMaterials.title,
    AVG(Ratings.rating_value) AS avg_rating
FROM StudyMaterials
LEFT JOIN Ratings ON StudyMaterials.material_id = Ratings.material_id
GROUP BY StudyMaterials.material_id;


-- List of materials with number of comments
CREATE VIEW MaterialComments AS
SELECT 
    StudyMaterials.material_id,
    StudyMaterials.title,
    COUNT(Comments.comment_id) AS comment_count
FROM StudyMaterials
LEFT JOIN Comments ON StudyMaterials.material_id = Comments.material_id
GROUP BY StudyMaterials.material_id;


-- User activity with number of materials, comments, and ratings
CREATE VIEW UserActivity AS
SELECT 
    Users.user_id,
    Users.username,
    COUNT(DISTINCT StudyMaterials.material_id) AS material_count,
    COUNT(DISTINCT Comments.comment_id) AS comment_count,
    COUNT(DISTINCT Ratings.rating_id) AS rating_count
FROM Users
LEFT JOIN StudyMaterials ON Users.user_id = StudyMaterials.user_id
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


-- view to get the latest materials uploaded by users
CREATE VIEW LatestMaterials AS
SELECT 
    StudyMaterials.material_id,
    StudyMaterials.title,
    StudyMaterials.user_id,
    StudyMaterials.description,
    StudyMaterials.created_at,
    Users.username
FROM StudyMaterials
JOIN Users ON StudyMaterials.user_id = Users.user_id
ORDER BY StudyMaterials.created_at DESC;



-- events --

-- event for archiving read notifications older than 30 days
CREATE EVENT ArchiveOldNotifications
ON SCHEDULE EVERY 1 DAY
DO
UPDATE Notifications 
SET is_archived = TRUE 
WHERE is_read = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);


-- indexes --


CREATE INDEX idx_material_id ON Ratings(material_id);
CREATE INDEX idx_ratings_user_id ON Ratings(user_id);

CREATE INDEX idx_notifications_user_id ON Notifications(user_id);

CREATE INDEX idx_is_read ON Notifications(is_read);

-- full-text search index
CREATE FULLTEXT INDEX idx_ft_title ON StudyMaterials(title, description);

-- unique indexes
CREATE UNIQUE INDEX idx_username ON Users(username);

-- composite indexes
CREATE INDEX idx_material_user ON Ratings(material_id, user_id);
CREATE INDEX idx_user_read ON Notifications(user_id, is_read);

-- index for read notifications to improve performance of queries
CREATE INDEX idx_notifications_read_created On Notifications(is_read, created_at);

CREATE UNIQUE INDEX idx_unique_follow ON Follows(follower_id, followed_id);


-- Sample data --

INSERT INTO UserLevels (level_name) VALUES ('Admin'), ('User');

INSERT INTO Users (username, password_hash, email, bio, study_field, user_level_id) VALUES
('JohnDoe', 'to-be-hashed-pw1', 'johndoe@example.com', 'Tech enthusiast.', 'Computer Science', 2),
('JaneSmith', 'to-be-hashed-pw2', 'janesmith@example.com', 'Math lover.', 'Mathematics', 2),
('AdminUser', 'to-be-hashed-pw3', 'adminuser@example.com', 'Site admin.', NULL, 1),
('AliceBrown', 'to-be-hashed-pw4', 'alicebrown@example.com', 'Aspiring data scientist.', 'Data Science', 2),
('BobWhite', 'to-be-hashed-pw5', 'bobwhite@example.com', 'AI and ML enthusiast.', 'Artificial Intelligence', 2),
('CharlieGreen', 'to-be-hashed-pw6', 'charliegreen@example.com', 'Passionate about cybersecurity.', 'Cybersecurity', 2),
('DavidBlack', 'to-be-hashed-pw7', 'davidblack@example.com', 'Full-stack web developer.', 'Software Engineering', 2),
('EveBlue', 'to-be-hashed-pw8', 'eveblue@example.com', 'Quantum computing geek.', 'Physics', 2);

INSERT INTO StudyMaterials (user_id, filename, filesize, media_type, title, description) VALUES
(1, 'file1.pdf', 1024, 'pdf', 'Introduction to Algorithms', 'This is a great book for learning algorithms.'),
(2, 'file2.doc', 2048, 'doc', 'Linear Algebra Notes', 'These are my notes from the linear algebra course.'),
(3, 'file3.py', 512, 'py', 'Python Basics', 'A very simple course for beginners. Data Structures and Algorithms are covered in depth.'),
(1, 'file4.html', 4096, 'html', 'Web Development Basics', 'Learn HTML, CSS, and JavaScript from scratch.'),
(2, 'file5.cpp', 8192, 'cpp', 'C++ Programming', 'A comprehensive guide to C++ programming language.'),
(3, 'file6.js', 1024, 'js', 'JavaScript Crash Course', 'A quick introduction to JavaScript programming.'),
(1, 'file7.sql', 2048, 'sql', 'SQL Basics', 'Learn SQL queries and database management.');

INSERT INTO Tags (tag_name) VALUES ('Algorithms'), ('Linear Algebra'), ('Python'), ('Data Structures'), ('JavaScript'),
('Java'), ('C++'), ('HTML'), ('CSS'), ('SQL');

INSERT INTO MaterialTags (material_id, tag_id) VALUES
(1, 1), -- Algorithms
(2, 2), -- Linear Algebra
(3, 3), -- Python
(3, 4); -- Data Structures


INSERT INTO Comments (material_id, user_id, comment) VALUES
(1, 2, 'Great book, highly recommended!'),
(1, 3, 'I agree, it helped me a lot in my studies.'),
(2, 1, 'Nice notes, very well organized.'),
(3, 2, 'This course is a great starting point for beginners.');

INSERT INTO Ratings (material_id, user_id, rating_value) VALUES
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
(6, 3),
(7, 1),
(7, 2),
(7, 3),
(8, 1),
(8, 2),
(8, 3);

-- Notification types
INSERT INTO NotificationTypes (notification_type_name) VALUES ('Follow'), ('Comment'), ('Rating'), ('Event');

-- Sample notifications for testing
INSERT INTO Notifications (user_id, notification_text, notification_type_id) VALUES
(2, 'JohnDoe started following you.', 1),
(3, 'JohnDoe started following you.', 1),
(1, 'JaneSmith started following you.', 1),
(1, 'JaneSmith started following you.', 1),
(1, 'JaneSmith commented on your material.', 2),
(1, 'JaneSmith rated your material.', 3),
(2, 'JohnDoe commented on your material.', 2),
(2, 'JohnDoe rated your material.', 3),
(3, 'JaneSmith commented on your material.', 2),
(3, 'JaneSmith rated your material.', 3),
(1, 'JaneSmith commented on your material.', 2),
(1, 'JaneSmith rated your material.', 3),
(1, 'JaneSmith commented on your material.', 2),
(1, 'JaneSmith rated your material.', 3);



