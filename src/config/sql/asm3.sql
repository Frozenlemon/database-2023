-- Set password validation
SET GLOBAL validate_password.policy = LOW;

-- Drop role
drop role if exists warehouse_admin;

-- Drop role
drop role if exists warehouse_staff;

-- Drop role
drop role if exists customer;

-- Create role
create role warehouse_admin;

-- Create role
create role warehouse_staff;

-- Create role
create role customer;

-- Drop user
drop user if exists 'whadmin'@'localhost';

-- Drop user
drop user if exists 'staff'@'localhost';

-- Drop user
drop user if exists 'customer'@'localhost';

-- Create user
create user 'whadmin'@'localhost' identified by 'CnSNL2Dw50Hd9gui';

-- Create user
create user 'staff'@'localhost' identified by 'vVlOlqte0giTh1IQ';

-- Create user
create user 'customer'@'localhost' identified by 'vVlOlqte0giTh1IQ';

-- Set role to user
grant warehouse_admin to 'whadmin'@'localhost';

-- Set role to user
grant warehouse_staff to 'staff'@'localhost';

-- Set role to user
grant customer to 'customer'@'localhost';

-- Drop the database if exist
drop database if exists public;

-- Create mew database
create database public;

-- Use the newly created database
use public;

-- Drop tables if exists
drop table if exists users;

-- Drop tables if exists
drop table if exists user_cart;

-- Drop tables if exists
drop table if exists warehouse_inventory;

-- Drop tables if exists
drop table if exists warehouse;

-- Drop tables if exists
drop table if exists transaction_detail;

-- Drop tables if exists
drop table if exists transaction;

-- Drop tables if exists
drop table if exists product;


-- Create users table
create table users(
    id int auto_increment primary key,
    username varchar(255) not null unique,
    password varchar(255) not null,
    role ENUM('whadmin', 'staff', 'customer')
);

-- insert users table
insert into users (username, password, role)
values ('admin', '$2b$05$A12iFK9mLG.GCsywdZ8pSettDiBobmROVkD5gKYGQhnHmkqzgZoTy', 'whadmin'),
       ('staff','$2b$05$A12iFK9mLG.GCsywdZ8pSe8810skpDO4zthGjKw.PFZ5dlMAzK0kG', 'staff'),
       ('customer', '$2b$05$iiDHJ/P/BQpeFMs/Hh6.2uIF8pNMEyqPV856xmJ7Zr9piwzvae6Py', 'customer');

-- Create users table
create table user_cart(
    id int primary key auto_increment,
    userId varchar(255) not null ,
    productId varchar(24) not null ,
    quantity int not null ,
    unique (userId, productId)
);

-- Create tokens table
create table tokens (
    id int auto_increment primary key,
    username varchar(255) not null ,
    token varchar(512) not null
);

-- Create warehouse table
create table warehouse(
	id int primary key AUTO_INCREMENT,
	name varchar(100) not null,
	address varchar(95) not null,
	city varchar(35) not null,
	province varchar(35) not null,
	volume bigint not null,
	fillVolume bigint not null default 0,
	unique (address, city, province)
);

-- Create warehouse_inventory table
create table warehouse_inventory(
	id bigint primary key AUTO_INCREMENT,
	warehouseId int not null,
    productId varchar(24) not null,
	quantity bigint not null,
    foreign key (warehouseId) references warehouse(id),
    unique (warehouseId, productId)
);

-- Create transaction table
create table transaction(
	id bigint primary key AUTO_INCREMENT,
	date timestamp not null default now(),
	userId varchar(255),
    quantity int not null default 0,
    price bigint not null default 0,
    unique (id, date)
);


-- Create transaction_detail table
create table transaction_detail(
	id bigint primary key AUTO_INCREMENT,
	transId bigint not null,
    productId varchar(24) not null,
    quantity int not null,
    price bigint not null,
    foreign key (transId) references Transaction(id),
    unique (transId, productId)
);

-- Create product table
create table product (
    id varchar(24) primary key,
    volume bigint
);

-- Create index
create index warehouse_search_index on warehouse (name, address, city, province);

-- Create index
create index inventory_search_index on warehouse_inventory (warehouseID, productID);

-- Define delimiter
-- delimiter //

-- Drop delete_warehouse_validation trigger
drop trigger if exists delete_warehouse_validation;

-- Create delete_warehouse_validation trigger
create trigger delete_warehouse_validation
    before delete on warehouse
    for each row
begin
    if (select count(warehouseID) from warehouse_inventory where warehouseID = old.id) != 0 then
        signal sqlstate '45000' set message_text = 'warehouse contain inventory';
    end if;
end;

-- Drop common procedure to update volume of a warehouse
drop procedure if exists common_update_volume;

-- Create common procedure to update volume of a warehouse
create procedure common_update_volume(in warehouse_id bigint)
begin
    update warehouse
    set fillVolume =
        (
            select
                sum(w.ivolume) as wvolume
            from (
                select
                    (p.volume*wi.quantity) as ivolume
                from warehouse_inventory wi
                    join product p on wi.productID = p.id
                where warehouseID = warehouse_id
                group by wi.id, warehouseID) w
        )
        where ID = warehouse_id;
end;

-- Drop update_warehouse_volume trigger
drop trigger if exists update_warehouse_volume;

-- Create update_warehouse_volume trigger
create trigger update_warehouse_volume
    after update on warehouse_inventory
    for each row
    call common_update_volume(new.warehouseID);

-- Drop insert_warehouse_volume trigger
drop trigger if exists insert_warehouse_volume;

-- Create insert_warehouse_volume trigger
create trigger insert_warehouse_volume
    after insert on warehouse_inventory
    for each row
    call common_update_volume(new.warehouseID);

-- Drop ensure_warehouse_volume_validity trigger
drop trigger if exists ensure_warehouse_volume_validity;

-- Create ensure_warehouse_volume_validity trigger
create trigger ensure_warehouse_volume_validity
    before update on warehouse
    for each row
    begin
        if NEW.volume < old.fillVolume then
            signal sqlstate '45000' set message_text = 'old volume cant be smaller than filled volume';
        end if;
    end;

-- Drop transaction_trigger
drop trigger if exists transaction_trigger;

-- Create transaction_trigger
create trigger transsaction_trigger
    after insert on transaction_detail
    for each row
    begin
        update transaction t
            set t.quantity = t.quantity + new.quantity,
                t.price = t.price + (new.quantity * new.price)
            where t.id = new.transId;
    end;

-- Drop ensure_inventory_after_transaction_trigger
drop trigger if exists ensure_inventory_after_transaction_trigger;

-- Create ensure_inventory_after_transaction_trigger
create trigger ensure_inventory_after_transaction_trigger
    after insert on transaction_detail
    for each row
    begin
        declare product_id varchar(255);
        declare warehouse_id int;

        set product_id = new.productId;

        select wi.warehouseID into warehouse_id
        from warehouse_inventory wi
        where wi.productID = product_id
        order by wi.quantity desc limit 1;

        update warehouse_inventory
        set quantity = quantity - new.quantity
        where productID = product_id and warehouseID = warehouse_id;
    end;

-- Drop empty_user_cart_trigger
drop trigger if exists empty_user_cart_trigger;

-- Create empty_user_cart_trigger
create trigger empty_user_cart_trigger
    after insert on transaction_detail
    for each row
    begin
        select userId into @user from transaction where id = new.transId;
        delete from user_cart where userId = @user and productId = new.productId;
    end;

-- Drop transactional procedure to transfer product between inventory
drop procedure  if exists product_transfer;

-- Create transactional procedure to transfer product between inventory
create procedure product_transfer (in product_id varchar(24), in from_wh bigint, in to_wh bigint, in qty bigint)
begin
    declare i bigint;
    declare c bool;
    declare _rollback bool default 0;
    declare continue handler for sqlexception set _rollback = 1;

    select count(warehouseID) into i from warehouse_inventory where warehouseID = to_wh and productID = product_id;
    if i != 0 then
        start transaction;
        update warehouse_inventory set quantity = quantity - qty where warehouseID = from_wh and productID = product_id;
        update warehouse_inventory set quantity = quantity + qty where warehouseID = to_wh and productID = product_id;

        select (Volume > fillVolume) into c from warehouse where warehouse.ID = to_wh;

        if !c then
            set _rollback = 1;
        end if;

        if _rollback = 1 then
            rollback;
            select true as err;
        else
            commit;
            select false as err;
        end if;

    else
        start transaction;
        update warehouse_inventory set quantity = quantity - qty where warehouseID = from_wh and productID = product_id;
        if _rollback = 1 then
            rollback;
            select true as err;
        else
            insert into warehouse_inventory (warehouseID, productID, quantity) values (to_wh, product_id, qty);
            commit;
            select false as err;
        end if;
    end if;
end;

-- Drop transactional procedure to process purchase order of a product
drop procedure if exists product_purchase_order;

-- Create transactional procedure to process purchase order of a product
create procedure product_purchase_order(in product_id varchar(24), in qty bigint)
begin
    declare iqty bigint default 0;
    declare pvolume bigint default (select volume from product where id = product_id);
    declare _rollback bool default 0;
    declare continue handler for sqlexception set _rollback = 1;

    start transaction;
    while _rollback = 0 and iqty < qty do
            create temporary table temp select id from warehouse where Volume > (fillVolume + pvolume) group by id;

            if (select count(id) from temp) = 0 then
                set _rollback = 1;
            else
                set iqty = iqty + 1;
                set @wid = (select warehouseID
                            from warehouse_inventory
                            where warehouseID in (
                                select id
                                from (select id from temp) t)
                              and productID = product_id
                            order by quantity, warehouseID
                            limit 1);
                if @wid IS NOT NULL then
                    update warehouse_inventory set quantity = quantity + 1 where productID = product_id and warehouseID = @wid;
                else
                    insert into warehouse_inventory (warehouseID, productID, quantity) value ((select id from temp limit 1), product_id, 1);
                end if;
            end if;
            drop temporary table if exists temp;
        end while;
    if _rollback = 1 then
        rollback;
        select true as err, 'inventory exceed all warehouse capacity' as message;
    else
        commit;
        select false as err, 'PO success' as message;
    end if;
    drop temporary table if exists temp;
end;

-- Drop transactional procedure to process transaction of a user cart
drop procedure if exists create_transaction;

-- Create transactional procedure to process transaction of a user cart
create procedure create_transaction(in id varchar(255), in product_data JSON)
begin
    declare new_bill_id int;
    declare _index int default 0;
    declare num_product int;
    declare _rollback bool default 0;
    declare continue handler for sqlexception set _rollback = 1;

    start transaction ;
    insert into transaction(userId) values (id);

    set new_bill_id = LAST_INSERT_ID();

    set num_product = JSON_LENGTH(product_data);

    while _index < num_product do
        SET @product_id = JSON_UNQUOTE(JSON_EXTRACT(product_data, CONCAT('$[', _index, '].id')));
        SET @quantity = JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(product_data, CONCAT('$[', _index, '].quantity'))), '$');
        SET @price = JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(product_data, CONCAT('$[', _index, '].price'))), '$');
        insert into transaction_detail (transId, productId, quantity, price)
            value (new_bill_id, @product_id, @quantity, @price);
        set _index = _index + 1;
        end while;

    if _rollback = 1 then
        rollback;
        select true as err, 'transaction failed' as message;
    else
        commit;
        select false as err, 'transaction success' as message;
    end if;
end;

-- Grant permission for role
grant select on public.product to warehouse_admin, warehouse_staff, customer;

-- Grant permission for role
grant select on public.warehouse to warehouse_staff, customer;

-- Grant permission for role
grant select, insert, update, delete on public.warehouse to warehouse_admin;

-- Grant permission for role
grant select, insert, update on public.warehouse_inventory to warehouse_staff;

-- Grant permission for role
grant insert, update on public.product to warehouse_staff;

-- Grant permission for role
grant execute on procedure public.product_purchase_order to warehouse_staff;

-- Grant permission for role
grant execute on procedure public.product_transfer to warehouse_staff;

-- Grant permission for role
grant select on public.warehouse_inventory to customer, warehouse_admin;


-- Set role as default for user
alter user 'whadmin'@'localhost' default role warehouse_admin;

-- Set role as default for user
alter user 'staff'@'localhost' default role warehouse_staff;

-- Set role as default for user
alter user 'customer'@'localhost' default role customer;

-- Set delimiter back to default
-- delimiter ;
