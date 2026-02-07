DROP DATABASE IF EXISTS wood_valley_bees_db;
CREATE DATABASE wood_valley_bees_db;
USE wood_valley_bees_db;

-- Database Creation
DROP TABLE IF EXISTS ROLES;
CREATE TABLE ROLES
(
    ID         INT AUTO_INCREMENT PRIMARY KEY,
    ROLE       ENUM ('USER', 'EMAIL', 'ADMIN', 'SUPER'),
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS USERS;
CREATE TABLE USERS
(
    ID         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    FIRST_NAME VARCHAR(30) DEFAULT NULL,
    LAST_NAME  VARCHAR(30) DEFAULT NULL,
    EMAIL      VARCHAR(254) NOT NULL UNIQUE,
    USERNAME   VARCHAR(60) DEFAULT NULL,
    PASSWORD   VARCHAR(60) DEFAULT NULL,
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS USERS_ROLES;
CREATE TABLE USERS_ROLES
(
    ID         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    USER_ID    INT,
    ROLE_ID    INT      DEFAULT 1,
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ur_user_id FOREIGN KEY (USER_ID) REFERENCES USERS (ID) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role_id FOREIGN KEY (ROLE_ID) REFERENCES ROLES (ID) ON DELETE SET NULL
);

DROP TABLE IF EXISTS PAGES;
CREATE TABLE PAGES
(
    ID   INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(100) NOT NULL UNIQUE,
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS PAGES_ROLES;
CREATE TABLE PAGES_ROLES
(
    ID         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    PG_ID      INT,
    ROLE_ID    INT      DEFAULT 1,
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pr_page_id FOREIGN KEY (PG_ID) REFERENCES PAGES (ID) ON DELETE CASCADE,
    CONSTRAINT fk_pr_role_id FOREIGN KEY (ROLE_ID) REFERENCES ROLES (ID) ON DELETE SET NULL
);

DROP TABLE IF EXISTS SECTIONS;
CREATE TABLE SECTIONS
(
    ID   INT                NOT NULL AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(30) UNIQUE NOT NULL,
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS PAGES_SECTIONS;
CREATE TABLE PAGES_SECTIONS
(
    ID           INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    PAGE_ID      INT NOT NULL,
    SECTION_ID   INT NOT NULL,
    SHOW_SECTION BOOL     DEFAULT TRUE,
    PRIORITY INT DEFAULT NULL,
    CREATED_ON   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ps_page_id FOREIGN KEY (PAGE_ID) REFERENCES PAGES (ID) ON DELETE CASCADE,
    CONSTRAINT fk_ps_section_id FOREIGN KEY (SECTION_ID) REFERENCES SECTIONS (ID) ON DELETE CASCADE
);

DROP TABLE IF EXISTS COMPONENTS;
CREATE TABLE COMPONENTS
(
    ID         INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    NAME       VARCHAR(30) NOT NULL UNIQUE,
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS PAGE_SECTION_COMPONENTS;
CREATE TABLE PAGE_SECTION_COMPONENTS
(
    ID              INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    PAGE_SECTION_ID INT,
    COMPONENT_ID INT      DEFAULT NULL,
    CREATED_ON   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_psc_section_id FOREIGN KEY (PAGE_SECTION_ID) REFERENCES PAGES_SECTIONS (ID) ON DELETE CASCADE,
    CONSTRAINT fk_psc_component_id FOREIGN KEY (COMPONENT_ID) REFERENCES COMPONENTS (ID) ON DELETE SET NULL
);

DROP TABLE IF EXISTS IMAGES;
CREATE TABLE IMAGES
(
    ID         INT                 NOT NULL AUTO_INCREMENT PRIMARY KEY,
    IMAGE_TEXT VARCHAR(50) DEFAULT NULL,
    SRC        VARCHAR(100) UNIQUE NOT NULL,
    ALT        VARCHAR(100)        NOT NULL,
    CREATED_ON DATETIME    DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME    DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS LINKS;
CREATE TABLE LINKS
(
    ID         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    LINK_TEXT  VARCHAR(50)  NOT NULL,
    URL        VARCHAR(100) NOT NULL UNIQUE,
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS TEXT_CONTENT;
CREATE TABLE TEXT_CONTENT
(
    ID         INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    TXT        TEXT NOT NULL,
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS LOCATIONS;
CREATE TABLE LOCATIONS
(
    ID   INT                 NOT NULL AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(255) UNIQUE NOT NULL,
    STREET_ADDRESS VARCHAR(200) DEFAULT NULL,
    CITY           VARCHAR(75)  DEFAULT NULL,
    STATE          VARCHAR(30)  DEFAULT NULL,
    TELEPHONE      VARCHAR(20)  DEFAULT NULL,
    ZIP            VARCHAR(10)  DEFAULT NULL,
    LAT  FLOAT4              NOT NULL,
    LNG  FLOAT4              NOT NULL,
    CREATED_ON     DATETIME     DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS EVENTS;
CREATE TABLE EVENTS
(
    ID              INT                 NOT NULL AUTO_INCREMENT PRIMARY KEY,
    TITLE           VARCHAR(255) UNIQUE NOT NULL,
    TEXT_CONTENT_ID INT                DEFAULT NULL,
    LOCATION_ID     INT                 NOT NULL,
    EVENT_TIME      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CREATED_ON      DATETIME           DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON      DATETIME           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_location_id FOREIGN KEY (LOCATION_ID) REFERENCES LOCATIONS (ID) ON DELETE CASCADE,
    CONSTRAINT fk_event_text_content_id FOREIGN KEY (TEXT_CONTENT_ID) REFERENCES TEXT_CONTENT (ID) ON DELETE SET NULL
);

DROP TABLE IF EXISTS COMPONENT_CONTENT;
CREATE TABLE COMPONENT_CONTENT
(
    ID                         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    PAGE_SECTION_COMPONENTS_ID INT NOT NULL,
    LINK_ID         INT      DEFAULT NULL,
    TEXT_CONTENT_ID INT      DEFAULT NULL,
    IMAGE_ID        INT      DEFAULT NULL,
    EVENT_ID        INT      DEFAULT NULL,
    CREATED_ON      DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_ON      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cc_component_id FOREIGN KEY (PAGE_SECTION_COMPONENTS_ID) REFERENCES PAGE_SECTION_COMPONENTS (ID) ON DELETE CASCADE,
    CONSTRAINT fk_cc_link_id FOREIGN KEY (LINK_ID) REFERENCES LINKS (ID) ON DELETE SET NULL,
    CONSTRAINT fk_cc_text_content_id FOREIGN KEY (TEXT_CONTENT_ID) REFERENCES TEXT_CONTENT (ID) ON DELETE SET NULL,
    CONSTRAINT fk_cc_image_id FOREIGN KEY (IMAGE_ID) REFERENCES IMAGES (ID) ON DELETE SET NULL,
    CONSTRAINT fk_cc_event_id FOREIGN KEY (EVENT_ID) REFERENCES EVENTS (ID) ON DELETE SET NULL
);

DROP TABLE IF EXISTS REVOKED_TOKENS;
CREATE TABLE REVOKED_TOKENS
(
    ID         INT AUTO_INCREMENT PRIMARY KEY,
    JTI        VARCHAR(255) NOT NULL UNIQUE,
    EXPIRES_AT INT          NOT NULL,
    REVOKED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_jti_expires (JTI, EXPIRES_AT)
);

DROP TABLE IF EXISTS LOGS;
CREATE TABLE LOGS
(
    ID         INT AUTO_INCREMENT PRIMARY KEY,
    ENDPOINT   VARCHAR(255)                 NOT NULL,
    LOG_LEVEL  ENUM ('success', 'warning', 'critical') NOT NULL,
    USERNAME   VARCHAR(60) DEFAULT NULL,
    MESSAGE    TEXT        DEFAULT NULL,
    CREATED_ON DATETIME    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_logs_created (CREATED_ON),
    INDEX idx_logs_endpoint (ENDPOINT),
    INDEX idx_logs_level (LOG_LEVEL),
    INDEX idx_logs_username (USERNAME)
);

-- Purge log entries older than 90 days (runs daily)
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS purge_old_logs;
CREATE EVENT purge_old_logs
    ON SCHEDULE EVERY 1 DAY
    DO DELETE
       FROM LOGS
       WHERE CREATED_ON < NOW() - INTERVAL 90 DAY;


-- mock data
INSERT INTO ROLES (ROLE)
VALUES ('USER'),
       ('ADMIN'),
       ('EMAIL'),
       ('SUPER');

INSERT INTO USERS (FIRST_NAME, LAST_NAME, EMAIL, USERNAME, PASSWORD)
VALUES ('Alice', 'Smith', 'alice@example.com', 'alice123', 'hashed_pw_1'),
       ('Bob', 'Johnson', 'bob@example.com', 'bobbyJ', 'hashed_pw_2'),
       ('Phil', 'McElroy', 'philmcelroy80@gmail.com', 'phillibus', 'password');

INSERT INTO USERS_ROLES (USER_ID, ROLE_ID)
VALUES (1, 1),
       (2, 1),
       (3, 1),
       (3, 2),
       (3, 3),
       (3, 4);

INSERT INTO PAGES (NAME)
VALUES ('home'),
       ('about-us'),
       ('events'),
       ('admin');

INSERT INTO PAGES_ROLES (PG_ID, ROLE_ID)
VALUES (1, 1),
       (2, 1),
       (3, 1),
       (4, 2),
       (4, 4);

INSERT INTO SECTIONS (NAME)
VALUES ('Header'),
       ('Hero'),
       ('About Us Hex Gallery'),
       ('Info'),
       ('Benefits'),
       ('Footer'),
       ('Info Picture'),
       ('Info Gallery'),
       ('Events'),
       ('Spaced Hex Gallery');

INSERT INTO PAGES_SECTIONS(ID, PAGE_ID, SECTION_ID, PRIORITY, SHOW_SECTION)
VALUES (1, 1, 1, 1, 1),
       (2, 1, 2, 2, 1),
       (3, 1, 3, 3, 1),
       (4, 1, 4, 4, 1),
       (7, 1, 5, 5, 1),
       (8, 1, 10, 6, 1),
       (9, 1, 6, 7, 1),
       (10, 2, 1, 1, 1),
       (11, 2, 2, 2, 1),
       (12, 2, 7, 3, 1),
       (13, 2, 8, 4, 1),
       (14, 2, 6, 5, 1),
       (15, 3, 1, 1, 1),
       (16, 3, 2, 2, 1),
       (17, 3, 9, 3, 1),
       (18, 3, 6, 4, 1);


INSERT INTO COMPONENTS (NAME)
VALUES ('Menu'),
       ('Carousel'),
       ('Title'),
       ('Image'),
       ('Hex Image Group'),
       ('Button'),
       ('Image Loader'),
       ('Email Field'),
       ('Contact Field'),
       ('Social Gallery'),
       ('Image Gallery'),
       ('Event Container'),
       ('Map Locator'),
       ('Text Container'),
       ('Benefits List'),
       ('Input Field'),
       ('Event List'),
       ('Subtitle'),
       ('Stackable Hex Gallery'),
       ('Hex Image'),
       ('Secondary Title');

INSERT INTO PAGE_SECTION_COMPONENTS (ID, PAGE_SECTION_ID, COMPONENT_ID)
VALUES (1, 1, 1),
       (2, 2, 2),
       (3, 3, 3),
       (4, 3, 5),
       (5, 4, 3),
       (6, 4, 18),
       (7, 4, 14),
       (8, 4, 6),
       (17, 7, 3),
       (18, 7, 18),
       (19, 7, 20),
       (20, 7, 15),
       (21, 8, 3),
       (22, 8, 18),
       (23, 8, 19),
       (24, 9, 3),
       (25, 9, 8),
       (26, 9, 6),
       (27, 9, 9),
       (28, 9, 10),
       (29, 10, 1),
       (30, 11, 2),
       (31, 12, 3),
       (32, 12, 18),
       (33, 12, 4),
       (34, 12, 14),
       (35, 13, 3),
       (36, 13, 18),
       (37, 13, 11),
       (38, 14, 3),
       (39, 14, 8),
       (40, 14, 6),
       (41, 14, 9),
       (42, 14, 10),
       (43, 15, 1),
       (44, 16, 2),
       (45, 17, 3),
       (46, 17, 18),
       (47, 17, 17),
       (48, 18, 3),
       (49, 18, 8),
       (50, 18, 6),
       (51, 18, 9),
       (52, 18, 10),
       (53, 3, 21),
       (54, 3, 18),
       (55, 3, 14),
       (56, 9, 18),
       (57, 14, 18),
       (58, 13, 14),
       (59, 18, 18);

INSERT INTO IMAGES (ID, IMAGE_TEXT, SRC, ALT)
VALUES (1, 'Facebook Logo', '/api/img/faceBookLogo.webp', 'Facebook Logo'),
       (3, 'Yelp Logo', '/api/img/yelpLogo.webp', 'Yelp Logo'),
       (7, 'Bee Keeper', '/api/img/bee-keeper.JPG', 'Image of a bee keeper'),
       (9, 'Beekeeper Honeycomb', '/api/img/bee-keeper-honeycomb.JPG', 'Image of a bee keeper in a honeycomb shape'),
       (10, 'Beekeeper Stock Image', '/api/img/bee-keeper-stock.JPG', 'Stock image of a beekeeper'),
       (11, 'Bee stock image', '/api/img/bee-stock.JPG', 'Stock image of a bee'),
       (12, 'Hive stock image', '/api/img/hive-stock.JPG', 'Stock image of a bee hive'),
       (13, 'Honey Dipper', '/api/img/honey-dipper.JPG', 'Image of a honey dipper'),
       (14, 'Stock image of honey', '/api/img/honey-stock.JPG', 'Stock image of honey'),
       (15, 'Honeycomb', '/api/img/honeycomb.JPG', 'Stock image of a honeycomb'),
       (16, 'Letter Clip Art', '/api/img/letter-icon.JPG', 'Clip art of a letter'),
       (17, 'Map Pin Clip Art', '/api/img/map-pin.JPG', 'Clip art of a map pin'),
       (18, 'Phone Clip Art', '/api/img/phone-icon.JPG', 'Clip art of a phone'),
       (20, 'Honey Products', '/api/img/products.JPG', 'Products in a hex shape'),
       (21, 'Beekeeper holding honeycomb', '/api/img/stock-bee-keeper.JPG',
        'Stock image of a bee keeper holding a bee hive sheet'),
       (22, 'Yellow Honey Dipper', '/api/img/yellow_honey_dipper.png',
        'A graphic of a honey dipper with a yellow outline'),
       (23, 'White Honey Dipper', '/api/img/white_honey_dipper.png',
        'A graphic of a honey dipper with a white outline'),
       (24, 'White Honey Bee Graphic', '/api/img/white_bee.png', 'A graphic of a bee a white outline'),
       (25, 'Yellow Honey Bee Graphic', '/api/img/yellow_bee.png', 'A graphic of a bee with yellow color fill'),
       (26, 'Default Image', '/default', 'Default Alt');

INSERT INTO LINKS (LINK_TEXT, URL)
VALUES ('Home', '/'),
       ('About Us', '/about-us'),
       ('Upcoming Events', '/events'),
       ('Login', '/login'),
       ('Admin', '/admin'),
       ('Default link', 'www.default.com');

INSERT INTO TEXT_CONTENT (TXT)
VALUES ('We produce organic honey sourced from local farms.'),
       ('We love to teach about the glories of raising bees and making honey.'),
       ('We are everywhere.  Come and see us.'),
       ('Benefit 1'),
       ('Benefit 2'),
       ('Benefit 3'),
       ('See More'),
       ('Learn More'),
       ('Wood Valley Bees'),
       ('Raw Honey'),
       ('About Us'),
       ('We Are All About The Honey, Honey'),
       ('Find out where your honey is coming from'),
       ('Education'),
       ('Upcoming Events'),
       ('Find out where we are next...Bee there!'),
       ('Benefits'),
       ('Nature''s Goodness, In Picture Form'),
       ('Contact Us'),
       ('Sign up to be notified on upcoming events'),
       ('blah blah blah blah blah blah blah blah blah blah blah'),
       ('Sign Up'),
       ('123 Some Street, Some City, TX 12345'),
       ('(210) 555-5555'),
       ('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'),
       ('Beyond good taste, good for you.'),
       ('Our Honey'),
       ('Our Team'),
       ('111 Event Street, Event Town, Event State, 12345'),
       ('33 Event Ave, Event Town, State, 54321'),
       ('Sign up to be notified of upcoming events'),
       ('Event at the Pearl'),
       ('Event at the Alamo Dome'),
       ('Default text');

INSERT INTO LOCATIONS (NAME, STREET_ADDRESS, CITY, STATE, ZIP, LAT, LNG, TELEPHONE)
VALUES ('Alamo Dome', '100 Montana St', 'San Antonio', 'TX', 78203, 29.41692, -98.47894, 2108448939),
       ('Pearl Brewery', '303 Pearl Pkwy', 'San Antonio', 'TX', 78215, 29.44242, -98.47932, 2105425905),
       ('Default Location', 'Default Address', 'San Antonio', 'TX', 78215, 29.42315, -98.48607, 2105555555);


INSERT INTO EVENTS (TITLE, TEXT_CONTENT_ID, LOCATION_ID, EVENT_TIME)
VALUES ('Honey Dome', 33, 1, NOW()),
       ('Honey Pearl', 32, 2, NOW()),
       ('Default Event', 34, 3, NOW());

INSERT INTO COMPONENT_CONTENT (ID, PAGE_SECTION_COMPONENTS_ID, LINK_ID, TEXT_CONTENT_ID, IMAGE_ID, EVENT_ID)
VALUES (1, 1, NULL, 9, NULL, NULL),
       (2, 1, 1, NULL, 25, NULL),
       (3, 1, 1, NULL, NULL, NULL),
       (4, 1, 2, NULL, NULL, NULL),
       (5, 1, 3, NULL, NULL, NULL),
       (6, 1, 4, NULL, NULL, NULL),
       (7, 2, NULL, NULL, 7, NULL),
       (8, 2, NULL, NULL, 10, NULL),
       (9, 2, NULL, NULL, 11, NULL),
       (10, 3, NULL, 10, NULL, NULL),
       (11, 4, NULL, NULL, 11, NULL),
       (12, 4, NULL, NULL, 14, NULL),
       (13, 4, NULL, NULL, 21, NULL),
       (14, 5, NULL, 8, 22, NULL),
       (15, 6, NULL, 1, NULL, NULL),
       (16, 7, NULL, 26, NULL, NULL),
       (17, 8, 2, 11, NULL, NULL),
       (26, 17, NULL, 17, 23, NULL),
       (27, 18, NULL, 27, NULL, NULL),
       (28, 19, NULL, NULL, 9, NULL),
       (29, 20, NULL, 4, NULL, NULL),
       (30, 20, NULL, 5, NULL, NULL),
       (31, 20, NULL, 6, NULL, NULL),
       (32, 21, NULL, 28, 22, NULL),
       (33, 22, NULL, 18, NULL, NULL),
       (34, 23, NULL, NULL, 14, NULL),
       (35, 23, NULL, NULL, 20, NULL),
       (36, 23, NULL, NULL, 21, NULL),
       (37, 24, NULL, 19, NULL, NULL),
       (38, 25, NULL, NULL, NULL, NULL),
       (39, 26, NULL, 26, NULL, NULL),
       (40, 27, NULL, 24, 18, NULL),
       (41, 27, NULL, 23, 17, NULL),
       (42, 28, NULL, NULL, 1, NULL),
       (43, 28, NULL, NULL, 3, NULL),
       (44, 29, NULL, 9, NULL, NULL),
       (45, 29, 1, NULL, 25, NULL),
       (46, 29, 1, NULL, NULL, NULL),
       (47, 29, 2, NULL, NULL, NULL),
       (48, 29, 3, NULL, NULL, NULL),
       (49, 29, 4, NULL, NULL, NULL),
       (50, 30, NULL, NULL, 15, NULL),
       (51, 30, NULL, NULL, 10, NULL),
       (52, 30, NULL, NULL, 11, NULL),
       (53, 31, NULL, 11, 22, NULL),
       (54, 32, NULL, 1, NULL, NULL),
       (55, 33, NULL, NULL, 12, NULL),
       (56, 34, NULL, 25, NULL, NULL),
       (57, 35, NULL, 29, 22, NULL),
       (58, 36, NULL, 13, NULL, NULL),
       (59, 37, NULL, NULL, 21, NULL),
       (60, 37, NULL, NULL, 7, NULL),
       (61, 38, NULL, 19, NULL, NULL),
       (62, 39, NULL, NULL, NULL, NULL),
       (63, 40, NULL, 26, NULL, NULL),
       (64, 41, NULL, 24, 18, NULL),
       (65, 41, NULL, 23, 17, NULL),
       (66, 42, NULL, NULL, 1, NULL),
       (67, 42, NULL, NULL, 3, NULL),
       (68, 43, NULL, 9, NULL, NULL),
       (69, 43, 1, NULL, 25, NULL),
       (70, 43, 1, NULL, NULL, NULL),
       (71, 43, 2, NULL, NULL, NULL),
       (72, 43, 3, NULL, NULL, NULL),
       (73, 43, 4, NULL, NULL, NULL),
       (74, 44, NULL, NULL, 7, NULL),
       (75, 44, NULL, NULL, 10, NULL),
       (76, 44, NULL, NULL, 11, NULL),
       (77, 45, NULL, 15, 22, NULL),
       (78, 46, NULL, 16, NULL, NULL),
       (79, 47, NULL, NULL, NULL, 1),
       (80, 47, NULL, NULL, NULL, 2),
       (81, 48, NULL, 19, NULL, NULL),
       (82, 49, NULL, NULL, NULL, NULL),
       (83, 50, NULL, 26, NULL, NULL),
       (84, 51, NULL, 24, 18, NULL),
       (85, 51, NULL, 23, 17, NULL),
       (86, 52, NULL, NULL, 1, NULL),
       (87, 52, NULL, NULL, 3, NULL),
       (88, 53, NULL, 11, 22, NULL),
       (89, 54, NULL, 12, NULL, NULL),
       (90, 55, NULL, 25, NULL, NULL),
       (91, 56, NULL, 31, NULL, NULL),
       (92, 57, NULL, 31, NULL, NULL),
       (93, 58, NULL, 25, NULL, NULL),
       (94, 59, NULL, 31, NULL, NULL),
       (95, 1, 5, NULL, NULL, NULL),
       (96, 29, 5, NULL, NULL, NULL),
       (97, 43, 5, NULL, NULL, NULL);
