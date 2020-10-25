-- Insert users
set @u1 = uuid_to_bin(uuid()); set @u2 = uuid_to_bin(uuid()); set @u3 = uuid_to_bin(uuid()); set @u4 = uuid_to_bin(uuid()); set @u5 = uuid_to_bin(uuid());
                insert into user (id, email, hash, salt, geolocation) values 
                (@u1, 'email1@test.org',' od87vst', 'v8dstdv', ST_GeomFromText('Point(10 10)')),
                (@u2, 'email2@test.org',' od87vst', 'v8dstdv', ST_GeomFromText('Point(10 10)')),
                (@u3, 'email3@test.org',' od87vst', 'v8dstdv', ST_GeomFromText('Point(10 10)')),
                (@u4, 'email4@test.org',' od87vst', 'v8dstdv', ST_GeomFromText('Point(10 10)')),
                (@u5, 'email5@test.org',' od87vst', 'v8dstdv', ST_GeomFromText('Point(10 10)'));

-- Insert books
set @b1 = uuid_to_bin(uuid()); set @b2 = uuid_to_bin(uuid()); set @b3 = uuid_to_bin(uuid()); set @b4 = uuid_to_bin(uuid()); set @b5 = uuid_to_bin(uuid()); 
                    insert into book (id, title, isbn13, release_date, editon) values 
                    (@b1, 'Cirque du Freak: A Living Nightmare', '9780316605106', '2004-2-22', 'First Edition'),
                    (@b2, 'The Red Pyramid (The Kane Chronicles, Book 1)', '9781410425362', '2012-6-15', 'Third Edition'),
                    (@b3, 'Trials of Apollo 1 Hidden Oracle BAM Exclusive', '9781484784983', '2016-8-01', 'B&N First Edition'),
                    (@b4, 'Magnus Chase and the Gods of Asgard, Book 1: The Sword of Summer', '9781423160915', '2015-10-06', '1st'),
                    (@b5, 'Magnus Chase and the Gods of Asgard, Book 2 The Hammer of Thor', '9781423160922', '2016-10-04', 'First Edition/First Printing');

-- Insert authors
set @a1 = uuid_to_bin(uuid()); set @a2 = uuid_to_bin(uuid()); 
            insert into author (id, firstname, lastname) values 
            (@a1, 'Darren', 'Shan'),
            (@a2, 'Rick', 'Riordan');

-- Insert book_author
insert into book_author (book_id, author_id) values (@b1, @a1), (@b2, @a2), (@b3, @a2), (@b4, @a2), (@b5, @a2);

-- Insert user_books
set @ub1 = uuid_to_bin(uuid()); set @ub2 = uuid_to_bin(uuid()); set @ub3 = uuid_to_bin(uuid()); set @ub4 = uuid_to_bin(uuid()); set @ub5 = uuid_to_bin(uuid()); 
                    insert into user_book (id, user_id, book_id, status, lending, selling, geolocation) values 
                    (@ub1, @u1, @b1, 'available', 1, 0, ST_GeomFromText('Point(-65.926772 18.376310)')),
                    (@ub2, @u1, @b2, 'unavailable', 1, 1, ST_GeomFromText('Point(-65.899706 18.374507)')),
                    (@ub3, @u1, @b3, 'available', 0, 1, ST_GeomFromText('Point(-65.958450 18.377507)')),
                    (@ub4, @u1, @b4, 'unavailable', 0, 0, ST_GeomFromText('Point(-65.846012 18.404668)')),
                    (@ub5, @u1, @b5, 'available', 1, 0, ST_GeomFromText('Point(-65.931912 18.373311)'));