create database book_your_show;
use book_your_show;

CREATE TABLE user_tb (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT FALSE,
    remember_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

CREATE TABLE movie_tb (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(100) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0,
    duration_minutes INT,
    release_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_rating (rating)
);

CREATE TABLE hall_tb (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hall_name VARCHAR(100) NOT NULL,
    total_seats INT NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE seats_tb (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hall_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_type ENUM('REGULAR','PREMIUM','RECLINER')
        DEFAULT 'REGULAR',
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seat_hall
        FOREIGN KEY (hall_id)
        REFERENCES hall_tb(id)
        ON DELETE CASCADE,
    UNIQUE KEY unique_seat (
        hall_id,
        seat_number
    )
);

CREATE TABLE showmoviehall_tb (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    hall_id BIGINT NOT NULL,
    show_date DATE NOT NULL,
    slot ENUM(
        '11:00-14:00',
        '14:30-17:30',
        '18:00-21:00'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_show_movie
        FOREIGN KEY (movie_id)
        REFERENCES movie_tb(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_show_hall
        FOREIGN KEY (hall_id)
        REFERENCES hall_tb(id)
        ON DELETE CASCADE,
    UNIQUE KEY unique_hall_slot (
        hall_id,
        show_date,
        slot
    ),
    INDEX idx_show_lookup (
        movie_id,
        show_date,
        slot
    )
);

CREATE TABLE booking_tb (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    hall_id BIGINT NOT NULL,
    slot_selected ENUM(
        '11:00-14:00',
        '14:30-17:30',
        '18:00-21:00'
    ) NOT NULL,
    booking_date DATE NOT NULL,
    seats_selected VARCHAR(255) NOT NULL,
    total_seats INT DEFAULT 1,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM(
        'PENDING',
        'SUCCESS',
        'FAILED'
    ) DEFAULT 'CONFIRMED',
    booking_status ENUM(
        'CONFIRMED',
        'CANCELLED'
    ) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id)
        REFERENCES user_tb(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_booking_movie
        FOREIGN KEY (movie_id)
        REFERENCES movie_tb(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_booking_hall
        FOREIGN KEY (hall_id)
        REFERENCES hall_tb(id)
        ON DELETE CASCADE,
    INDEX idx_booking_lookup (
        movie_id,
        hall_id,
        booking_date,
        slot_selected
    )
);
